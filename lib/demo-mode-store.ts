/**
 * Presentation Demo Mode — staff-only, runtime-toggleable, in-memory.
 * Anchored on `globalThis` for the same reason as lib/shop-override-store.ts
 * and lib/orders/store.ts: a Server Action, a Route Handler, and a Server
 * Component render can each load this module as a separate instance within
 * one process.
 *
 * When on: the mselen payment provider becomes lib/payments/demo-mselen.ts's
 * auto-confirming stand-in instead of the real (unbuilt) phase-2 provider,
 * and a few customer-facing screens switch to more theatrical copy.
 *
 * Defaults to on in `pnpm dev` only (no explicit toggle yet needed while
 * iterating locally), and off everywhere else — most importantly in a real
 * production build, where this must never be live for a real customer by
 * accident just because nobody has touched the staff toggle yet.
 */
const DEFAULT_ENABLED = process.env.NODE_ENV !== 'production'

const globalDemoMode = globalThis as unknown as { __coffeeBarDemoMode?: boolean }

export function isDemoModeEnabled(): boolean {
  return globalDemoMode.__coffeeBarDemoMode ?? DEFAULT_ENABLED
}

export function setDemoMode(enabled: boolean): void {
  globalDemoMode.__coffeeBarDemoMode = enabled
}

/** Test-only reset — mirrors __resetStoreOverrideForTests. */
export function __resetDemoModeForTests(): void {
  globalDemoMode.__coffeeBarDemoMode = false
}
