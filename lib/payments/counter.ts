import { getOrder } from '../orders/store.ts'
import type { PaymentInstruction, PaymentProvider, ReconcileStatus } from './provider.ts'

/**
 * docs/PAYMENTS.md §4: initiate() issues the pickup code and makes no
 * external call. reconcile() "reads whatever the staff surface wrote" — for
 * counter payment that write *is* the order's own state (staff mark it paid
 * directly via transitionOrder on the staff surface, step 10), so reconcile
 * reads the order store rather than keeping a second, parallel record that
 * could drift from it.
 */
export const CounterProvider: PaymentProvider = {
  id: 'counter',

  async initiate(order) {
    const instruction: PaymentInstruction = {
      kind: 'counter',
      pickupCode: order.pickupCode,
      amount: order.total,
    }
    // No external call to make idempotent against — the order id doubles as
    // the provider reference for this provider only.
    return { providerRef: order.id, instruction }
  },

  async reconcile(providerRef): Promise<ReconcileStatus> {
    const order = getOrder(providerRef)
    if (!order) return 'pending'

    switch (order.state) {
      case 'paid':
      case 'making':
      case 'ready':
      case 'collected':
        return 'paid'
      case 'payment_failed':
      case 'cancelled':
        return 'failed'
      default:
        return 'pending'
    }
  },
}
