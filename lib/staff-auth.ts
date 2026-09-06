import { cookies } from 'next/headers'

import { verifyStaffPasscode } from './staff-passcode.ts'

/**
 * Phase 1 staff auth: a single shared passcode (set behind the bar, not
 * per-person accounts — decision 2 in CLAUDE.md is about customer identity,
 * not this) plus a name typed at login, so `order_events` still records a
 * real person as the actor per docs/BUILD-PLAN.md step 10. Sessions are an
 * in-memory token set, the same shape as the order store itself — there is
 * no database in this project yet, so a server restart also signs everyone
 * out, which is an acceptable phase-1 cost for a device kept behind the
 * counter.
 */
const COOKIE_NAME = 'staff_session'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12 // one shift

export type StaffSession = { staffName: string }

/**
 * Anchored on `globalThis`, not a plain module-scope `let` — see the same
 * comment in lib/orders/store.ts. A Server Action (login) and a Route
 * Handler (every /api/staff/* endpoint) can load this file as separate
 * module instances even within one process, and a plain `let` here would
 * mean a session created at login is invisible to the route handlers that
 * are supposed to check it.
 */
const globalStaffAuth = globalThis as unknown as { __coffeeBarStaffSessions?: Map<string, StaffSession> }
const sessionsByToken = (globalStaffAuth.__coffeeBarStaffSessions ??= new Map())

export { verifyStaffPasscode }

export async function createStaffSession(staffName: string): Promise<void> {
  const token = crypto.randomUUID()
  sessionsByToken.set(token, { staffName })

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return sessionsByToken.get(token) ?? null
}

export async function clearStaffSession(): Promise<void> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (token) sessionsByToken.delete(token)
  store.delete(COOKIE_NAME)
}

/** Test-only reset — mirrors __resetOrderStoreForTests. */
export function __resetStaffAuthForTests(): void {
  sessionsByToken.clear()
}
