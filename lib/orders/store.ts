import { addMoney } from '../money.ts'
import { generatePickupCode, shopDayKey } from './pickup-code.ts'
import { canTransition } from './state-machine.ts'
import type { TransitionOptions } from './state-machine.ts'
import type { Order, OrderActor, OrderEvent, OrderLine, OrderState } from './types.ts'

/**
 * In-memory only — there is no database in this project yet. The shape here
 * (idempotent creation, idempotent transitions, an immutable event log) is
 * what actually matters per docs/PAYMENTS.md; swapping the backing store for
 * a real database later is a change to this file alone, not to anything
 * that calls it. Known consequence: state does not survive a server
 * restart, unlike a real deployment would need.
 */

type OrderStoreState = {
  orders: Map<string, Order>
  events: OrderEvent[]
  orderIdByIdempotencyKey: Map<string, string>
  /** docs/PAYMENTS.md §2: "Default 20 minutes, configurable." */
  awaitingPaymentExpiryMs: number
}

function freshState(): OrderStoreState {
  return {
    orders: new Map(),
    events: [],
    orderIdByIdempotencyKey: new Map(),
    awaitingPaymentExpiryMs: 20 * 60 * 1000,
  }
}

/**
 * Next.js compiles Server Components/Actions and Route Handlers as separate
 * bundles ("layers") that can each get their own instance of this module,
 * even within one dev server process — a plain module-scope `let` here
 * silently forks into two disconnected stores depending on which layer
 * touches it first (an order created via a Server Action becomes invisible
 * to a Route Handler's `getOrder`, which is exactly the bug this anchors
 * against). `globalThis` is the one thing every layer shares, so pinning
 * state there keeps it a true process-wide singleton regardless of which
 * layer's module graph loads this file.
 */
const globalStore = globalThis as unknown as { __coffeeBarOrderStore?: OrderStoreState }
const state = (globalStore.__coffeeBarOrderStore ??= freshState())

function nowIso(): string {
  return new Date().toISOString()
}

/**
 * Lazy expiry: there is no scheduled sweep yet (that's step 11's
 * reconciler loop) — every read checks the one order in front of it, which
 * is enough for correctness even though a genuinely stale order that
 * nobody ever re-reads won't expire until something does read it.
 */
function expireIfStale(order: Order): Order {
  if (order.state !== 'awaiting_payment') return order
  const age = Date.now() - new Date(order.updatedAt).getTime()
  if (age < state.awaitingPaymentExpiryMs) return order

  const result = transitionOrder(order.id, 'payment_failed', { type: 'system' }, {
    payload: { reason: 'awaiting_payment expired' },
  })
  return result.ok ? result.order : order
}

function appendEvent(
  orderId: string,
  fromState: OrderState | null,
  toState: OrderState,
  actor: OrderActor,
  payload?: Record<string, unknown>,
): void {
  state.events.push({
    id: crypto.randomUUID(),
    orderId,
    fromState,
    toState,
    actor,
    payload,
    at: nowIso(),
  })
}

export type CreateOrderInput = {
  shopId: string
  lines: OrderLine[]
  providerId: Order['providerId']
  deviceToken: string
}

/**
 * Issues a pickup code scoped to this shop and day, from the codes already
 * on other orders in that scope — not exported, since only the store knows
 * that scope.
 */
function issuePickupCode(shopId: string, at: Date): string {
  const day = shopDayKey(at)
  const codesToday = new Set<string>()
  for (const order of state.orders.values()) {
    if (order.shopId === shopId && shopDayKey(new Date(order.createdAt)) === day) {
      codesToday.add(order.pickupCode)
    }
  }
  return generatePickupCode(codesToday)
}

/**
 * Idempotent on `idempotencyKey` (docs/PAYMENTS.md §7.4) — a retried submit
 * over a flaky connection returns the original order rather than creating a
 * second one, regardless of whether the retried input matches exactly.
 */
export function createOrder(
  input: CreateOrderInput,
  idempotencyKey: string,
  actor: OrderActor,
): Order {
  const existingId = state.orderIdByIdempotencyKey.get(idempotencyKey)
  if (existingId) {
    const existing = state.orders.get(existingId)
    if (existing) return existing
  }

  const at = new Date()
  const order: Order = {
    id: crypto.randomUUID(),
    shopId: input.shopId,
    pickupCode: issuePickupCode(input.shopId, at),
    // Defensively copied — "locked at placed" means the caller mutating the
    // array (or a line object) they passed in afterward must not reach the
    // stored order.
    lines: input.lines.map((line) => ({ ...line, customizations: [...line.customizations] })),
    total: addMoney(0, ...input.lines.map((line) => line.lineTotal)),
    state: 'placed',
    providerId: input.providerId,
    deviceToken: input.deviceToken,
    createdAt: at.toISOString(),
    updatedAt: at.toISOString(),
  }

  state.orders.set(order.id, order)
  state.orderIdByIdempotencyKey.set(idempotencyKey, order.id)
  appendEvent(order.id, null, 'placed', actor)

  return order
}

export function getOrder(id: string): Order | undefined {
  const order = state.orders.get(id)
  return order ? expireIfStale(order) : undefined
}

export type OrderListFilter = {
  states?: readonly OrderState[]
  /** Case-insensitive — pickup codes are already uppercase, but staff typing isn't. */
  pickupCode?: string
}

/**
 * Newest first, per docs/BUILD-PLAN.md step 10. Reverses Map insertion
 * order rather than sorting on `createdAt` — two orders placed within the
 * same millisecond would tie on the timestamp string, but insertion order
 * is always creation order since `transitionOrder` re-sets an existing key
 * in place rather than moving it. Runs every order through `expireIfStale`
 * first so a stale `awaiting_payment` order that nobody has read yet
 * doesn't show as live just because the sweep in step 11 hasn't run.
 */
export function listOrders(filter: OrderListFilter = {}): Order[] {
  const code = filter.pickupCode?.toUpperCase()
  return Array.from(state.orders.values())
    .reverse()
    .map(expireIfStale)
    .filter((order) => (filter.states ? filter.states.includes(order.state) : true))
    .filter((order) => (code ? order.pickupCode === code : true))
}

/**
 * Records the provider's reference for this order once initiate() has run.
 * Not a state transition (nothing in OrderState changes), so it doesn't
 * touch order_events — the provider's own audit trail covers this detail.
 */
export function setProviderRef(orderId: string, providerRef: string): Order | undefined {
  const order = state.orders.get(orderId)
  if (!order) return undefined
  const updated: Order = { ...order, providerRef, updatedAt: nowIso() }
  state.orders.set(orderId, updated)
  return updated
}

export function getOrderEvents(orderId: string): OrderEvent[] {
  return state.events.filter((event) => event.orderId === orderId)
}

export type TransitionResult =
  | { ok: true; order: Order; applied: boolean }
  | { ok: false; error: 'not_found' | 'invalid_transition' }

/**
 * Idempotent on (orderId, toState) (docs/PAYMENTS.md §7.3): if the order is
 * already in the target state, this is a no-op that returns the current
 * order with `applied: false` and appends nothing to `order_events` — a
 * replayed gateway callback or a double-tapped staff button changes nothing
 * the second time.
 */
export function transitionOrder(
  orderId: string,
  toState: OrderState,
  actor: OrderActor,
  options: TransitionOptions & { reason?: string; payload?: Record<string, unknown> } = {},
): TransitionResult {
  const order = state.orders.get(orderId)
  if (!order) return { ok: false, error: 'not_found' }

  if (order.state === toState) {
    return { ok: true, order, applied: false }
  }

  if (!canTransition(order.state, toState, options)) {
    return { ok: false, error: 'invalid_transition' }
  }

  const fromState = order.state
  const updated: Order = {
    ...order,
    state: toState,
    updatedAt: nowIso(),
    ...(toState === 'cancelled' && options.reason ? { cancelReason: options.reason } : {}),
  }
  state.orders.set(orderId, updated)
  appendEvent(orderId, fromState, toState, actor, options.payload)

  return { ok: true, order: updated, applied: true }
}

/** Test-only reset — mirrors clearCart in lib/cart-store.ts. */
export function __resetOrderStoreForTests(): void {
  Object.assign(state, freshState())
}

/** Test-only — lets tests exercise expiry without waiting 20 real minutes. */
export function __setAwaitingPaymentExpiryMsForTests(ms: number): void {
  state.awaitingPaymentExpiryMs = ms
}
