'use server'

import { redirect } from 'next/navigation'

import { clearStaffSession, createStaffSession, verifyStaffPasscode } from '../staff-auth.ts'

export type StaffLoginResult =
  | { ok: true }
  | { ok: false; error: 'missing_name' | 'invalid_passcode' }

export async function staffLoginAction(
  _prev: StaffLoginResult | null,
  formData: FormData,
): Promise<StaffLoginResult> {
  const staffName = String(formData.get('staffName') ?? '').trim()
  const passcode = String(formData.get('passcode') ?? '')

  if (!staffName) return { ok: false, error: 'missing_name' }
  if (!verifyStaffPasscode(passcode)) return { ok: false, error: 'invalid_passcode' }

  await createStaffSession(staffName)
  redirect('/staff')
}

export async function staffLogoutAction(): Promise<void> {
  await clearStaffSession()
  redirect('/staff')
}
