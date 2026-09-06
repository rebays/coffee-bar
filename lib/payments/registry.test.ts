import { test } from 'node:test'
import assert from 'node:assert/strict'

import { CounterProvider } from './counter.ts'
import { __resetRegistryForTests, __setProviderForTests, getProvider } from './registry.ts'
import type { PaymentProvider } from './provider.ts'

test.afterEach(() => {
  __resetRegistryForTests()
})

test('counter resolves to CounterProvider', () => {
  assert.equal(getProvider('counter'), CounterProvider)
})

test('egate and mselen reject rather than silently doing nothing', async () => {
  await assert.rejects(() => getProvider('egate').initiate({} as never))
  await assert.rejects(() => getProvider('mselen').reconcile('ref'))
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
