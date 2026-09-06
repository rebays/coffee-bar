import { cookies } from 'next/headers'

/**
 * docs/PAYMENTS.md §7.7: an anonymous device identity, in an httpOnly
 * cookie, alongside the order id in the URL — so a customer who closes the
 * tab (or, in phase 2, gets redirected to a gateway and back) can still be
 * attributed as the same actor. Not an access-control boundary: reading
 * order status only needs the id in the URL, matching how the pickup code
 * screen already doubles as the receipt.
 */
const COOKIE_NAME = 'device_token'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

/**
 * Reads the existing token if present, or mints and sets a new one.
 * Setting a cookie is only valid from a Server Action or Route Handler, so
 * this must only be called from one of those — never from a Server
 * Component render.
 */
export async function ensureDeviceToken(): Promise<string> {
  const store = await cookies()
  const existing = store.get(COOKIE_NAME)?.value
  if (existing) return existing

  const token = crypto.randomUUID()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })
  return token
}
