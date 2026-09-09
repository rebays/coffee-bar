'use server'

import { redirect } from 'next/navigation'

import { clearStaffSession, createStaffSession, verifyStaffPasscode } from '../staff-auth.ts'

export type StaffLoginResult =
  | { ok: true }
  | { ok: false; error: 'missing_name' | 'invalid_passcode' }

/**
 * Every staff-gated page (currently /staff and /kitchen) renders the same
 * StaffLoginForm on success — an allowlist, not a raw pass-through of
 * whatever the form claims, so this can never become an open redirect.
 */
const STAFF_SURFACES = ['/staff', '/kitchen'] as const

function isStaffSurface(value: FormDataEntryValue | null): value is (typeof STAFF_SURFACES)[number] {
  return typeof value === 'string' && (STAFF_SURFACES as readonly string[]).includes(value)
}

export async function staffLoginAction(
  _prev: StaffLoginResult | null,
  formData: FormData,
): Promise<StaffLoginResult> {
  const staffName = String(formData.get('staffName') ?? '').trim()
  const passcode = String(formData.get('passcode') ?? '')
  const returnToRaw = formData.get('returnTo')
  const returnTo = isStaffSurface(returnToRaw) ? returnToRaw : '/staff'

  if (!staffName) return { ok: false, error: 'missing_name' }
  if (!verifyStaffPasscode(passcode)) return { ok: false, error: 'invalid_passcode' }

  await createStaffSession(staffName)
  redirect(returnTo)
}

export async function staffLogoutAction(): Promise<void> {
  await clearStaffSession()
  redirect('/staff')
}
