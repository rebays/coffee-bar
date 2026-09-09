import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  __resetStoreOverrideForTests,
  getStoreOverride,
  setStoreOverride,
} from './shop-override-store.ts'

test.beforeEach(() => {
  __resetStoreOverrideForTests()
})

test('defaults to AUTO with nothing set', () => {
  assert.equal(getStoreOverride(), 'AUTO')
})

test('setStoreOverride persists until changed again', () => {
  setStoreOverride('FORCE_OPEN')
  assert.equal(getStoreOverride(), 'FORCE_OPEN')

  setStoreOverride('FORCE_CLOSED')
  assert.equal(getStoreOverride(), 'FORCE_CLOSED')
})

test('__resetStoreOverrideForTests puts it back to AUTO', () => {
  setStoreOverride('FORCE_CLOSED')
  __resetStoreOverrideForTests()
  assert.equal(getStoreOverride(), 'AUTO')
})
