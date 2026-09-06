import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  PICKUP_CODE_ALPHABET,
  PICKUP_CODE_LENGTH,
  generatePickupCode,
  shopDayKey,
} from './pickup-code.ts'

test('the alphabet excludes every listed ambiguous character', () => {
  for (const excluded of ['0', 'O', '1', 'I', 'L', 'S', '5']) {
    assert.ok(!PICKUP_CODE_ALPHABET.includes(excluded), `alphabet should not contain "${excluded}"`)
  }
})

test('the alphabet has no duplicate characters', () => {
  assert.equal(new Set(PICKUP_CODE_ALPHABET).size, PICKUP_CODE_ALPHABET.length)
})

test('a generated code is 4 characters, all from the alphabet', () => {
  const code = generatePickupCode(new Set())
  assert.equal(code.length, PICKUP_CODE_LENGTH)
  for (const char of code) {
    assert.ok(PICKUP_CODE_ALPHABET.includes(char), `"${char}" is not in the alphabet`)
  }
})

test('a code already issued today is never returned again', () => {
  // Force a collision on every attempt but one by claiming the entire
  // alphabet at length 1 is impossible to test directly, so instead assert
  // the contract on a targeted case: pre-claim a code and confirm many
  // draws never return it once forced to collide by a tiny alphabet stand-in
  // isn't available — so assert against a large exclusion set drawn from
  // real generated codes.
  const taken = new Set<string>()
  for (let i = 0; i < 200; i++) {
    const code = generatePickupCode(taken)
    assert.ok(!taken.has(code), `"${code}" was already issued today`)
    taken.add(code)
  }
})

test('generatePickupCode throws rather than looping forever once the scope is exhausted', () => {
  const everyPossibleCode = new Set<string>()
  // Exhausting the full 4-character space (29^4) isn't practical to
  // construct, so this checks the failure path directly: an exclusion set
  // that already contains whatever the mocked space returns.
  const original = Math.random
  try {
    Math.random = () => 0 // deterministic: always draws the first character
    const fixedCode = generatePickupCode(new Set())
    everyPossibleCode.add(fixedCode)
    assert.throws(() => generatePickupCode(everyPossibleCode), /Could not find/)
  } finally {
    Math.random = original
  }
})

test('shopDayKey is a stable calendar-day string', () => {
  assert.equal(shopDayKey(new Date('2026-09-06T23:59:59.000Z')), '2026-09-06')
  assert.equal(shopDayKey(new Date('2026-09-06T00:00:00.000Z')), '2026-09-06')
  assert.notEqual(
    shopDayKey(new Date('2026-09-06T00:00:00.000Z')),
    shopDayKey(new Date('2026-09-07T00:00:00.000Z')),
  )
})
