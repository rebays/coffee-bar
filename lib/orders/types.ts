import type { Money } from '../money.ts'

/**
 * Provider-agnostic — docs/PAYMENTS.md §2 is explicit that no per-provider
 * states get added here. `payment_failed` covers expiry, decline and
 * abandonment alike; the reason a payment failed is a detail for
 * `order_events`, not a fork in the state machine.
 */
export type OrderState =
  | 'placed'
  | 'awaiting_payment'
  | 'paid'
  | 'payment_failed'
  | 'making'
  | 'ready'
  | 'collected'
  | 'cancelled'

/**
 * A snapshot, not a reference. Every field here is captured once at order
 * creation from the resolved cart line — nothing in lib/orders ever reads
 * lib/fixtures.ts again afterward, which is what "totals locked at placed"
 * actually means in code rather than in prose.
 */
export type OrderLine = {
  slug: string
  name: string
  /** Resolved choices that differ from default, e.g. ["Large", "Oat"]. */
  customizations: string[]
  quantity: number
  unitPrice: Money
  lineTotal: Money
}

export type Order = {
  id: string
  shopId: string
  pickupCode: string
  lines: OrderLine[]
  /** Locked at creation — the sum of `lines[].lineTotal` at that moment. */
  total: Money
  state: OrderState
  providerId: 'counter' | 'egate' | 'mselen'
  /** Set once the provider's initiate() returns; undefined immediately after placed. */
  providerRef?: string
  /** Anonymous device identity — the httpOnly cookie itself is step 9's concern. */
  deviceToken: string
  createdAt: string
  updatedAt: string
  cancelReason?: string
}

export type OrderActor =
  | { type: 'customer'; deviceToken: string }
  | { type: 'staff'; staffId: string }
  | { type: 'provider'; providerId: Order['providerId'] }
  | { type: 'system' }

/** Immutable — appended, never edited or removed. */
export type OrderEvent = {
  id: string
  orderId: string
  /** null only for the creation event, which has no prior state. */
  fromState: OrderState | null
  toState: OrderState
  actor: OrderActor
  payload?: Record<string, unknown>
  at: string
}
