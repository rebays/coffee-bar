import { test } from 'node:test'
import assert from 'node:assert/strict'

import { verifyStaffPasscode } from './staff-passcode.ts'

// Session creation/lookup goes through next/headers' cookies(), which needs
// a request scope and can't even be imported under plain `node --test` —
// like lib/device-token.ts, that plumbing isn't unit tested here. The
// passcode check lives in its own module for exactly this reason and is.

test('the correct passcode verifies', () => {
  assert.equal(verifyStaffPasscode(process.env.STAFF_PASSCODE ?? 'honiara-staff'), true)
})

test('the wrong passcode does not verify', () => {
  assert.equal(verifyStaffPasscode('not-it'), false)
})

test('an empty passcode does not verify', () => {
  assert.equal(verifyStaffPasscode(''), false)
})
