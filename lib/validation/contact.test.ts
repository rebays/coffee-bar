import { test } from 'node:test'
import assert from 'node:assert/strict'

import { isValidPhone, normalizePhone, passwordMeetsPolicy, validateSignupFields } from './contact.ts'

test('normalizePhone always produces a consistent +677-prefixed form', () => {
  assert.equal(normalizePhone('7412345'), '+6777412345') // bare local number
  assert.equal(normalizePhone('+677 741 2345'), '+6777412345') // full international, spaced
  assert.equal(normalizePhone('677 7412345'), '+6777412345') // country code, no plus
})

test('isValidPhone accepts a 7-digit Solomon Islands number, however it is typed', () => {
  assert.ok(isValidPhone('7412345'))
  assert.ok(isValidPhone('+6777412345'))
  assert.ok(isValidPhone('677 741 2345'))
})

test('isValidPhone rejects the wrong length or garbage', () => {
  assert.ok(!isValidPhone('12345')) // too short
  assert.ok(!isValidPhone('74123456789')) // too long
  assert.ok(!isValidPhone(''))
  assert.ok(!isValidPhone('not a phone number'))
})

test('passwordMeetsPolicy enforces the minimum length', () => {
  assert.ok(passwordMeetsPolicy('longenough'))
  assert.ok(!passwordMeetsPolicy('short'))
})

test('validateSignupFields reports every failing field, not just the first', () => {
  const errors = validateSignupFields({
    fullName: '',
    phone: 'not-a-number',
    password: 'short',
    confirmPassword: 'different',
  })
  assert.ok(errors.fullName)
  assert.ok(errors.phone)
  assert.ok(errors.password)
  assert.ok(errors.confirmPassword)
})

test('validateSignupFields passes clean input through with no errors', () => {
  const errors = validateSignupFields({
    fullName: 'Jane Doe',
    phone: '7412345',
    password: 'longenough',
    confirmPassword: 'longenough',
  })
  assert.deepEqual(errors, {})
})
