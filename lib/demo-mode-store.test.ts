import { test } from 'node:test'
import assert from 'node:assert/strict'

import { __resetDemoModeForTests, isDemoModeEnabled, setDemoMode } from './demo-mode-store.ts'

test.beforeEach(() => {
  __resetDemoModeForTests()
})

test('__resetDemoModeForTests forces off, for deterministic tests regardless of NODE_ENV', () => {
  assert.equal(isDemoModeEnabled(), false)
})

test('with nothing explicitly set, the default follows NODE_ENV — on outside production', () => {
  // node:test doesn't run with NODE_ENV=production, so this exercises the
  // same "unset" branch dev/test share; a real production build is the one
  // environment where this must come back false with nothing touched yet.
  const globalDemoMode = globalThis as unknown as { __coffeeBarDemoMode?: boolean }
  globalDemoMode.__coffeeBarDemoMode = undefined
  assert.equal(isDemoModeEnabled(), process.env.NODE_ENV !== 'production')
})

test('setDemoMode persists until changed again, and always wins over the environment default', () => {
  setDemoMode(true)
  assert.equal(isDemoModeEnabled(), true)

  setDemoMode(false)
  assert.equal(isDemoModeEnabled(), false)
})

test('__resetDemoModeForTests puts it back to off', () => {
  setDemoMode(true)
  __resetDemoModeForTests()
  assert.equal(isDemoModeEnabled(), false)
})
