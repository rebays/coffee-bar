import { test } from 'node:test'
import assert from 'node:assert/strict'

import { __resetDemoModeForTests, setDemoMode } from '../demo-mode-store.ts'
import { CounterProvider } from './counter.ts'
import { DemoMSelenProvider } from './demo-mselen.ts'
import { __resetRegistryForTests, __setProviderForTests, getProvider } from './registry.ts'
import type { PaymentProvider } from './provider.ts'

// beforeEach, not just afterEach — demo mode's default now follows
// NODE_ENV (lib/demo-mode-store.ts), so a test can no longer assume "off"
// just because nothing has touched it yet; every test needs its own
// explicit, known starting state regardless of run order.
test.beforeEach(() => {
  __resetDemoModeForTests()
})

test.afterEach(() => {
  __resetRegistryForTests()
  __resetDemoModeForTests()
})

test('counter resolves to CounterProvider', () => {
  assert.equal(getProvider('counter'), CounterProvider)
})

test('egate and mselen reject rather than silently doing nothing', async () => {
  await assert.rejects(() => getProvider('egate').initiate({} as never))
  await assert.rejects(() => getProvider('mselen').reconcile('ref'))
})

test('mselen resolves to the demo provider only while demo mode is on', async () => {
  await assert.rejects(() => getProvider('mselen').reconcile('ref'))

  setDemoMode(true)
  assert.equal(getProvider('mselen'), DemoMSelenProvider)

  setDemoMode(false)
  await assert.rejects(() => getProvider('mselen').reconcile('ref'))
})

test('demo mode never affects counter or egate', () => {
  setDemoMode(true)
  assert.equal(getProvider('counter'), CounterProvider)
  assert.notEqual(getProvider('egate'), DemoMSelenProvider)
})

test('a test override replaces the registered provider until reset', () => {
  const fake: PaymentProvider = {
    id: 'counter',
    async initiate() {
      return { providerRef: 'fake', instruction: { kind: 'counter', pickupCode: 'AB2X', amount: 100 } }
    },
    async reconcile() {
      return 'paid'
    },
  }

  __setProviderForTests('counter', fake)
  assert.equal(getProvider('counter'), fake)

  __resetRegistryForTests()
  assert.equal(getProvider('counter'), CounterProvider)
})
