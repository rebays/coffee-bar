import { test } from 'node:test'
import assert from 'node:assert/strict'

import { hashSecret, verifySecret } from './password.ts'

test('a hashed secret verifies against the original but never matches the plaintext directly', async () => {
  const hash = await hashSecret('correct horse battery staple')
  assert.notEqual(hash, 'correct horse battery staple')
  assert.ok(await verifySecret('correct horse battery staple', hash))
})

test('the wrong secret does not verify', async () => {
  const hash = await hashSecret('correct horse battery staple')
  assert.ok(!(await verifySecret('wrong guess', hash)))
})

test('two hashes of the same secret differ (a fresh salt each time), but both verify', async () => {
  const a = await hashSecret('same input')
  const b = await hashSecret('same input')
  assert.notEqual(a, b)
  assert.ok(await verifySecret('same input', a))
  assert.ok(await verifySecret('same input', b))
})
