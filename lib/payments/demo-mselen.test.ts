import { test } from 'node:test'
import assert from 'node:assert/strict'

import type { Order } from '../orders/types.ts'
import { DemoMSelenProvider } from './demo-mselen.ts'

const ORDER = { id: 'o1', pickupCode: 'K7QX', total: 5000 } as unknown as Order

test('initiate returns a push instruction carrying the pickup code as reference', async () => {
  const { providerRef, instruction } = await DemoMSelenProvider.initiate(ORDER)

  assert.match(providerRef, /^demo:\d+$/)
  assert.deepEqual(instruction, {
    kind: 'push',
    merchantCode: 'DEMO-MSELEN',
    reference: 'K7QX',
    amount: 5000,
  })
})

test('reconcile is pending before the auto-confirm delay, paid comfortably after it', async () => {
  // Wide margins rather than testing right at the 3000ms edge — each
  // `reconcile` call is itself a few ms after `Date.now()` is read here, so
  // a boundary-tight case (e.g. "2999ms ago") is inherently flaky.
  assert.equal(await DemoMSelenProvider.reconcile(`demo:${Date.now()}`), 'pending')
  assert.equal(await DemoMSelenProvider.reconcile(`demo:${Date.now() - 100}`), 'pending')
  assert.equal(await DemoMSelenProvider.reconcile(`demo:${Date.now() - 5000}`), 'paid')
})

test('reconcile is pending, not a throw, for a malformed or foreign providerRef', async () => {
  assert.equal(await DemoMSelenProvider.reconcile('not-a-demo-ref'), 'pending')
  assert.equal(await DemoMSelenProvider.reconcile('o1'), 'pending') // a real CounterProvider-style ref
})
