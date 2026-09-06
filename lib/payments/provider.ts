import type { Money } from '../money.ts'
import type { Order } from '../orders/types.ts'

/** docs/PAYMENTS.md §3, verbatim. */
export type PaymentInstruction =
  | { kind: 'counter'; pickupCode: string; amount: Money }
  | { kind: 'redirect'; url: string }
  | { kind: 'push'; merchantCode: string; reference: string; amount: Money }

export type ReconcileStatus = 'pending' | 'paid' | 'failed'

export interface PaymentProvider {
  readonly id: 'counter' | 'egate' | 'mselen'

  /**
   * Called once when the customer confirms the order. Must be idempotent on
   * orderId — a retried submit must not create a second payment.
   */
  initiate(order: Order): Promise<{
    providerRef: string
    instruction: PaymentInstruction
  }>

  /**
   * Authoritative status check. Safe to call repeatedly. This is what the
   * reconciler uses, and it is the only thing allowed to move an order to
   * paid.
   */
  reconcile(providerRef: string): Promise<ReconcileStatus>
}
