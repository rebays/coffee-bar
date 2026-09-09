/**
 * Staff-only override of the schedule in lib/shop-hours.ts. In-memory,
 * anchored on `globalThis` for the same reason as lib/orders/store.ts and
 * lib/staff-auth.ts — a Server Action, a Route Handler, and a Server
 * Component render can each load this module as a separate instance within
 * one process, and a plain module-scope `let` would silently fork into
 * disconnected copies.
 */
export type StoreOverride = 'AUTO' | 'FORCE_OPEN' | 'FORCE_CLOSED'

const globalOverride = globalThis as unknown as { __coffeeBarStoreOverride?: StoreOverride }

export function getStoreOverride(): StoreOverride {
  return globalOverride.__coffeeBarStoreOverride ?? 'AUTO'
}

export function setStoreOverride(value: StoreOverride): void {
  globalOverride.__coffeeBarStoreOverride = value
}

/** Test-only reset — mirrors __resetOrderStoreForTests. */
export function __resetStoreOverrideForTests(): void {
  globalOverride.__coffeeBarStoreOverride = 'AUTO'
}
