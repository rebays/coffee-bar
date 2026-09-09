/**
 * docs/BUILD-PLAN.md step 11: starts the payment reconciler's scheduled
 * sweep once when the server boots. Node-only — the in-memory order store
 * this sweeps needs a persistent process, which the edge runtime doesn't
 * provide.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startReconcilerLoop } = await import('./lib/payments/reconciler')
    // 1.5s rather than the 30s default: cheap for CounterProvider either way
    // (docs/PAYMENTS.md §7.2), and it's what makes the simulated M-SELEN
    // flow's ~3s auto-confirm (lib/payments/demo-mselen.ts) actually land
    // close to 3s instead of up to 30s late.
    startReconcilerLoop(1500)
  }
}
