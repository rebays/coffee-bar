'use server'

import { redirect } from 'next/navigation'

import { createCustomerSessionCookie, clearCustomerSession } from '../customers/auth.ts'
import { hashSecret, verifySecret } from '../customers/password.ts'
import {
  consumeVerificationCode,
  createPendingCustomer,
  findCustomerByPhone,
  getCustomerById,
  getLatestVerificationCode,
  incrementVerificationAttempts,
  replaceVerificationCode,
} from '../customers/store.ts'
import {
  codeExpiresAt,
  generateVerificationCode,
  hasExceededAttempts,
  isCodeExpired,
  resendCooldownRemaining,
} from '../customers/verification.ts'
import { getNotificationProvider } from '../notifications/registry.ts'
import { normalizePhone, validateSignupFields } from '../validation/contact.ts'
import type { SignupFieldErrors } from '../validation/contact.ts'

/**
 * FormData + (prevState, formData) throughout, wired to useActionState —
 * matching lib/actions/staff-auth.ts's shape (the closest existing sibling:
 * a login form), not lib/actions/place-order.ts's plain-argument shape
 * (built for an imperative multi-step client flow). Success redirects
 * server-side via `redirect()`, same as staff login; only genuine field/
 * request errors come back as state for the form to render inline.
 *
 * Phone-only throughout: signup, login and OTP delivery all key off phone
 * number (see lib/validation/contact.ts) — there is no email path anymore.
 */

export type SignupResult =
  | { ok: false; fieldErrors: SignupFieldErrors }
  | { ok: false; error: 'duplicate' }

export async function signUpAction(_prev: SignupResult | null, formData: FormData): Promise<SignupResult> {
  const fullName = String(formData.get('fullName') ?? '')
  const phoneInput = String(formData.get('phone') ?? '')
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  const fieldErrors = validateSignupFields({ fullName, phone: phoneInput, password, confirmPassword })
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  const phone = normalizePhone(phoneInput)

  const existing = await findCustomerByPhone(phone)
  if (existing) {
    return { ok: false, error: 'duplicate' }
  }

  const passwordHash = await hashSecret(password)
  const customer = await createPendingCustomer({ fullName: fullName.trim(), phone, passwordHash })

  await issueAndSendCode(customer.id, phone)

  redirect(`/signup/verify?customerId=${customer.id}`)
}

/**
 * Shared by signup and resend — generates a fresh code, replaces whatever
 * code existed, and sends it by SMS. Swallows a send failure rather than
 * throwing: the account/code both still exist either way, and the verify
 * screen's own "Resend code" is the recovery path if delivery didn't arrive.
 */
async function issueAndSendCode(customerId: string, phone: string): Promise<{ sent: boolean }> {
  const now = new Date()
  const code = generateVerificationCode()
  const codeHash = await hashSecret(code)
  await replaceVerificationCode({ customerId, channel: 'phone', codeHash, expiresAt: codeExpiresAt(now), now })

  try {
    await getNotificationProvider('phone').sendVerificationCode(phone, code)
    return { sent: true }
  } catch {
    return { sent: false }
  }
}

export type VerifyResult = { ok: false; error: 'invalid_or_expired' | 'too_many_attempts' | 'not_found' }

/**
 * One generic "invalid_or_expired" rather than distinguishing "wrong code"
 * from "expired code" — telling an attacker which one it was is a free
 * signal to hand over, and either way the customer's next step is the same:
 * request a new code.
 */
export async function verifyCodeAction(_prev: VerifyResult | null, formData: FormData): Promise<VerifyResult> {
  const customerId = String(formData.get('customerId') ?? '')
  const submittedCode = String(formData.get('code') ?? '')

  const customer = await getCustomerById(customerId)
  if (!customer) return { ok: false, error: 'not_found' }

  if (!customer.verified) {
    const code = await getLatestVerificationCode(customerId)
    if (!code || code.consumedAt) return { ok: false, error: 'invalid_or_expired' }
    if (hasExceededAttempts(code.attemptCount)) return { ok: false, error: 'too_many_attempts' }

    const now = new Date()
    if (isCodeExpired(code.expiresAt, now)) return { ok: false, error: 'invalid_or_expired' }

    const matches = await verifySecret(submittedCode, code.codeHash)
    if (!matches) {
      await incrementVerificationAttempts(code.id)
      return { ok: false, error: 'invalid_or_expired' }
    }

    await consumeVerificationCode(code.id, customerId, now)
  }

  await createCustomerSessionCookie(customerId)
  redirect('/account')
}

export type ResendResult =
  | { ok: true; sent: boolean }
  | { ok: false; error: 'cooldown'; secondsRemaining: number }
  | { ok: false; error: 'already_verified' | 'not_found' }

export async function resendCodeAction(_prev: ResendResult | null, formData: FormData): Promise<ResendResult> {
  const customerId = String(formData.get('customerId') ?? '')

  const customer = await getCustomerById(customerId)
  if (!customer) return { ok: false, error: 'not_found' }
  if (customer.verified) return { ok: false, error: 'already_verified' }

  const now = new Date()
  const previous = await getLatestVerificationCode(customerId)
  if (previous) {
    const secondsRemaining = resendCooldownRemaining(previous.lastSentAt, now)
    if (secondsRemaining > 0) return { ok: false, error: 'cooldown', secondsRemaining }
  }

  const { sent } = await issueAndSendCode(customerId, customer.phone)
  return { ok: true, sent }
}

export type LoginResult = { ok: false; error: 'invalid_credentials' }

/**
 * One generic "invalid_credentials" for both "no such account" and "wrong
 * password" — the standard login-enumeration guard. An unverified account
 * is sent straight to the verify screen rather than shown an error — the
 * password was right, this isn't a failed login, just an unfinished signup.
 */
export async function loginAction(_prev: LoginResult | null, formData: FormData): Promise<LoginResult> {
  const phone = normalizePhone(String(formData.get('phone') ?? ''))
  const password = String(formData.get('password') ?? '')

  const customer = await findCustomerByPhone(phone)
  if (!customer) return { ok: false, error: 'invalid_credentials' }

  const matches = await verifySecret(password, customer.passwordHash)
  if (!matches) return { ok: false, error: 'invalid_credentials' }

  if (!customer.verified) redirect(`/signup/verify?customerId=${customer.id}`)

  await createCustomerSessionCookie(customer.id)
  redirect('/account')
}

export async function logoutAction(): Promise<void> {
  await clearCustomerSession()
  redirect('/menu')
}
