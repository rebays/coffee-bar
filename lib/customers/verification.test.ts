import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  codeExpiresAt,
  generateVerificationCode,
  hasExceededAttempts,
  isCodeExpired,
  MAX_VERIFY_ATTEMPTS,
  resendCooldownRemaining,
  RESEND_COOLDOWN_SECONDS,
} from './verification.ts'

test('generateVerificationCode is always six digits, zero-padded', () => {
  for (let i = 0; i < 50; i++) {
    const code = generateVerificationCode()
    assert.match(code, /^\d{6}$/)
  }
})

test('a code is not expired the instant it is issued, and is once its window passes', () => {
  const now = new Date('2026-01-01T00:00:00Z')
  const expiresAt = codeExpiresAt(now)
  assert.ok(!isCodeExpired(expiresAt, now))
  assert.ok(!isCodeExpired(expiresAt, new Date(expiresAt.getTime() - 1)))
  assert.ok(isCodeExpired(expiresAt, expiresAt))
  assert.ok(isCodeExpired(expiresAt, new Date(expiresAt.getTime() + 1)))
})

test('hasExceededAttempts trips at the configured ceiling, not one past it', () => {
  assert.ok(!hasExceededAttempts(MAX_VERIFY_ATTEMPTS - 1))
  assert.ok(hasExceededAttempts(MAX_VERIFY_ATTEMPTS))
})

test('resendCooldownRemaining counts down to zero and never goes negative', () => {
  const lastSentAt = new Date('2026-01-01T00:00:00Z')
  const halfway = new Date(lastSentAt.getTime() + (RESEND_COOLDOWN_SECONDS / 2) * 1000)
  assert.equal(
    resendCooldownRemaining(lastSentAt, halfway),
    Math.ceil(RESEND_COOLDOWN_SECONDS / 2),
  )

  const wayAfter = new Date(lastSentAt.getTime() + RESEND_COOLDOWN_SECONDS * 10 * 1000)
  assert.equal(resendCooldownRemaining(lastSentAt, wayAfter), 0)
})
