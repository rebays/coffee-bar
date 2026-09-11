import { cookies } from 'next/headers'

import { createCustomerSession, deleteCustomerSession, getCustomerBySessionToken } from './store.ts'
import type { Customer } from './store.ts'

/**
 * Mirrors lib/staff-auth.ts's cookie shape exactly (an opaque random token,
 * httpOnly, looked up server-side) but is otherwise entirely separate: its
 * own cookie name, its own session table (CustomerSession, not staff's
 * in-memory Map), so a customer session can never be confused with — or
 * accidentally grant — a staff session, and vice versa.
 */
const COOKIE_NAME = 'customer_session'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

export async function createCustomerSessionCookie(customerId: string): Promise<void> {
  const token = crypto.randomUUID()
  await createCustomerSession(customerId, token)

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })
}

/**
 * Called from app/layout.tsx on every single page — including every page
 * that has nothing to do with accounts — so a database hiccup (or simply
 * DATABASE_URL not being configured yet) here must never take the whole
 * site down with it. Worst case on failure: this request renders as if
 * signed out, which is recoverable, unlike a crashed root layout.
 */
export async function getCurrentCustomer(): Promise<Customer | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    return await getCustomerBySessionToken(token)
  } catch (error) {
    console.error('getCurrentCustomer: session lookup failed', error)
    return null
  }
}

export async function clearCustomerSession(): Promise<void> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (token) await deleteCustomerSession(token)
  store.delete(COOKIE_NAME)
}
