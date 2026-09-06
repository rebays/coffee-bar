/**
 * docs/BUILD-PLAN.md step 11: starts the payment reconciler's scheduled
 * sweep once when the server boots. Node-only — the in-memory order store
 * this sweeps needs a persistent process, which the edge runtime doesn't
 * provide.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startReconcilerLoop } = await import('./lib/payments/reconciler')
    startReconcilerLoop()
  }
}
