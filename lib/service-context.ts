/**
 * The customer's service type (dine-in vs. takeaway) and table number, set
 * once from a QR code's URL parameters (or a manual choice on the Home
 * screen) and carried for the rest of the session.
 *
 * Deliberately plain cookies, not the httpOnly device-token cookie in
 * lib/device-token.ts: that one is an anonymous identity that must never be
 * readable or writable from client code. This is the opposite — display
 * data (a table number shown in the header) with no security weight, so a
 * page render needs to read it server-side (via service-context-server.ts)
 * just as easily as a client component writes it here.
 *
 * No 'use client' directive — like lib/resolve-cart-line.ts, this is plain
 * logic with no React in it, only ever called from client components, but
 * safely importable from anywhere without forcing a client boundary on it.
 */
export type ServiceType = 'dine-in' | 'takeaway'

export const SERVICE_TYPE_COOKIE = 'cb_service_type'
export const TABLE_NUMBER_COOKIE = 'cb_table_number'
const SERVICE_TYPE_STORAGE_KEY = 'cb_service_type'
const TABLE_NUMBER_STORAGE_KEY = 'cb_table_number'

/** A dine-in/takeaway choice is a session, not a permanent identity — expires well within a day. */
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12

function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`
}

/**
 * Persists both places the spec asks for — localStorage for client reads,
 * a plain cookie so a server-rendered page (the menu's header) can show it
 * on the very next request without waiting on client JS. Omitting
 * `tableNumber` clears any previously-stored one, so switching to takeaway
 * mid-session doesn't leave a stale table number behind.
 */
export function saveServiceContext(serviceType: ServiceType, tableNumber?: string): void {
  localStorage.setItem(SERVICE_TYPE_STORAGE_KEY, serviceType)
  setCookie(SERVICE_TYPE_COOKIE, serviceType)

  if (tableNumber) {
    localStorage.setItem(TABLE_NUMBER_STORAGE_KEY, tableNumber)
    setCookie(TABLE_NUMBER_COOKIE, tableNumber)
  } else {
    localStorage.removeItem(TABLE_NUMBER_STORAGE_KEY)
    deleteCookie(TABLE_NUMBER_COOKIE)
  }
}
