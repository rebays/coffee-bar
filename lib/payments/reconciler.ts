import { listOrders, transitionOrder } from '../orders/store.ts'
import { getProvider } from './registry.ts'

export type SweepResult = {
  checked: number
  paid: number
  failed: number
  pending: number
}

/**
 * docs/PAYMENTS.md §7.2 / docs/BUILD-PLAN.md step 11: one pass over every
 * order still in `awaiting_payment`, asking its own provider for the
 * authoritative status via `reconcile()` and advancing state accordingly.
 * For CounterProvider this is the "cheap database read" the docs describe —
 * it can only ever report 'paid' once staff have already moved the order
 * off `awaiting_payment` via the staff surface, at which point this sweep
 * no longer sees it. The payoff is phase 2: an eGate order stuck here after
 * a dropped mobile redirect gets recovered by the exact same code path.
 *
 * `listOrders()` already runs every order through the store's lazy expiry
 * check before filtering by state, so a stale order is moved to
 * `payment_failed` as a side effect of that call alone and simply won't
 * appear in the list handed back here — the "expires stale orders" half of
 * step 11's done-when is covered by the store, not by anything below.
 *
 * Safe to run concurrently with itself: `transitionOrder` is idempotent on
 * (order id, target state) (docs/PAYMENTS.md §7.3), so two overlapping
 * sweeps racing to reconcile the same order produce one real transition and
 * one no-op, never a double transition or a duplicate `order_events` entry.
 */
export async function sweepAwaitingPayments(): Promise<SweepResult> {
  const result: SweepResult = { checked: 0, paid: 0, failed: 0, pending: 0 }

  for (const order of listOrders({ states: ['awaiting_payment'] })) {
    result.checked += 1

    // initiate() hasn't finished yet (the request is still in flight) —
    // nothing to reconcile against until a providerRef exists.
    if (!order.providerRef) {
      result.pending += 1
      continue
    }

    const status = await getProvider(order.providerId).reconcile(order.providerRef)

    switch (status) {
      case 'paid':
        transitionOrder(order.id, 'paid', { type: 'provider', providerId: order.providerId })
        result.paid += 1
        break
      case 'failed':
        transitionOrder(
          order.id,
          'payment_failed',
          { type: 'provider', providerId: order.providerId },
          { payload: { reason: 'reconcile reported failed' } },
        )
        result.failed += 1
        break
      case 'pending':
        result.pending += 1
        break
    }
  }

  return result
}

const DEFAULT_INTERVAL_MS = 30_000

type ReconcilerLoopState = { timer: ReturnType<typeof setInterval> | null; sweeping: boolean }

/**
 * Anchored on globalThis for the same reason as lib/orders/store.ts and
 * lib/staff-auth.ts: Next.js can load this module more than once across
 * separately-bundled layers within one process, and a plain module-scope
 * `let` wouldn't stop each of those instances from starting its own timer.
 */
const globalReconciler = globalThis as unknown as { __coffeeBarReconcilerLoop?: ReconcilerLoopState }

/**
 * Starts the scheduled sweep. Called once from instrumentation.ts's
 * register() when the server boots. If a previous tick's sweep is still
 * awaiting a provider response when the next tick fires, that tick is
 * skipped rather than stacking a second overlapping sweep — a belt-and-
 * braces optimization on top of the idempotency guarantee above, not a
 * substitute for it.
 */
export function startReconcilerLoop(intervalMs: number = DEFAULT_INTERVAL_MS): void {
  const state = (globalReconciler.__coffeeBarReconcilerLoop ??= { timer: null, sweeping: false })
  if (state.timer) return

  state.timer = setInterval(() => {
    if (state.sweeping) return
    state.sweeping = true
    sweepAwaitingPayments()
      .catch((error: unknown) => {
        console.error('reconciler sweep failed', error)
      })
      .finally(() => {
        state.sweeping = false
      })
  }, intervalMs)
}

/** Test-only reset — mirrors __resetOrderStoreForTests. */
export function __resetReconcilerLoopForTests(): void {
  if (globalReconciler.__coffeeBarReconcilerLoop?.timer) {
    clearInterval(globalReconciler.__coffeeBarReconcilerLoop.timer)
  }
  globalReconciler.__coffeeBarReconcilerLoop = { timer: null, sweeping: false }
}
