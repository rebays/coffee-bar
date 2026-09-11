import { randomInt } from 'node:crypto'

/**
 * Pure rules for one-time verification codes — no I/O, so every rule here
 * is unit-testable with an injected `now` rather than the real clock. The DB
 * read/write around these lives in lib/customers/store.ts.
 */

export const CODE_EXPIRY_MINUTES = 10
export const MAX_VERIFY_ATTEMPTS = 5
export const RESEND_COOLDOWN_SECONDS = 60

/**
 * Cryptographically random, unlike lib/orders/pickup-code.ts's Math.random —
 * that code is a cosmetic counter-matching label; this one proves control of
 * an email or phone number, so it needs to be unguessable, not just unique.
 */
export function generateVerificationCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

export function codeExpiresAt(now: Date): Date {
  return new Date(now.getTime() + CODE_EXPIRY_MINUTES * 60_000)
}

export function isCodeExpired(expiresAt: Date, now: Date): boolean {
  return now.getTime() >= expiresAt.getTime()
}

export function hasExceededAttempts(attemptCount: number): boolean {
  return attemptCount >= MAX_VERIFY_ATTEMPTS
}

/** Seconds remaining before another resend is allowed; 0 once the cooldown has passed. */
export function resendCooldownRemaining(lastSentAt: Date, now: Date): number {
  const elapsedSeconds = (now.getTime() - lastSentAt.getTime()) / 1000
  return Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds))
}
