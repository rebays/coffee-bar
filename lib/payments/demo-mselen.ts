import type { PaymentInstruction, PaymentProvider, ReconcileStatus } from './provider.ts'

/**
 * Presentation Demo Mode's stand-in for the real (unbuilt) M-SELEN provider.
 * Auto-confirms a few seconds after initiate() — but critically, `paid` is
 * still only ever set by lib/payments/reconciler.ts's real, server-side
 * sweep calling reconcile() and finding this returns 'paid', exactly like a
 * genuine gateway would. There is no client-side timer anywhere that claims
 * an order is paid; the client only ever polls and displays what the server
 * has actually confirmed. That's the one rule this file must never break —
 * see docs/PAYMENTS.md and CLAUDE.md #9.
 *
 * The initiate timestamp rides inside `providerRef` itself (`demo:<ms>`)
 * rather than needing new persistent state — reconcile() only ever receives
 * the providerRef string, per the PaymentProvider interface.
 */
const AUTO_CONFIRM_DELAY_MS = 3000

export const DemoMSelenProvider: PaymentProvider = {
  id: 'mselen',

  async initiate(order) {
    const providerRef = `demo:${Date.now()}`
    const instruction: PaymentInstruction = {
      kind: 'push',
      merchantCode: 'DEMO-MSELEN',
      reference: order.pickupCode,
      amount: order.total,
    }
    return { providerRef, instruction }
  },

  async reconcile(providerRef): Promise<ReconcileStatus> {
    const match = /^demo:(\d+)$/.exec(providerRef)
    if (!match) return 'pending'

    const initiatedAt = Number(match[1])
    const elapsed = Date.now() - initiatedAt
    return elapsed >= AUTO_CONFIRM_DELAY_MS ? 'paid' : 'pending'
  },
}
