import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  __resetOrderStoreForTests,
  __setAwaitingPaymentExpiryMsForTests,
  createOrder,
  getOrder,
  getOrderEvents,
  setProviderRef,
  transitionOrder,
} from '../orders/store.ts'
import type { OrderLine } from '../orders/types.ts'
import { __resetRegistryForTests, __setProviderForTests } from './registry.ts'
import { sweepAwaitingPayments } from './reconciler.ts'
import type { PaymentProvider, ReconcileStatus } from './provider.ts'

const CUSTOMER = { type: 'customer', deviceToken: 'device-1' } as const
const LINES: OrderLine[] = [
  { slug: 'flat-white', name: 'Flat white', customizations: [], quantity: 1, unitPrice: 3800, lineTotal: 3800 },
]

function fakeProvider(status: ReconcileStatus): PaymentProvider & { calls: string[] } {
  const calls: string[] = []
  return {
    id: 'counter',
    calls,
    async initiate() {
      throw new Error('not used in these tests')
    },
    async reconcile(providerRef) {
      calls.push(providerRef)
      return status
    },
  }
}

function awaitingPaymentOrder(providerRef?: string) {
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: CUSTOMER.deviceToken, lines: LINES },
    'idem-1',
    CUSTOMER,
  )
  transitionOrder(order.id, 'awaiting_payment', { type: 'system' })
  if (providerRef) setProviderRef(order.id, providerRef)
  return order
}

test.beforeEach(() => {
  __resetOrderStoreForTests()
  __resetRegistryForTests()
})

test('a provider-reported paid order advances to paid', async () => {
  const order = awaitingPaymentOrder('ref-1')
  __setProviderForTests('counter', fakeProvider('paid'))

  const result = await sweepAwaitingPayments()

  assert.equal(getOrder(order.id)!.state, 'paid')
  assert.deepEqual(result, { checked: 1, paid: 1, failed: 0, pending: 0 })
})

test('a provider-reported failed order advances to payment_failed with a reason', async () => {
  const order = awaitingPaymentOrder('ref-1')
  __setProviderForTests('counter', fakeProvider('failed'))

  const result = await sweepAwaitingPayments()

  assert.equal(getOrder(order.id)!.state, 'payment_failed')
  assert.equal(result.failed, 1)
  const events = getOrderEvents(order.id)
  assert.equal(events.at(-1)?.payload?.reason, 'reconcile reported failed')
})

test('a still-pending order is left untouched', async () => {
  const order = awaitingPaymentOrder('ref-1')
  __setProviderForTests('counter', fakeProvider('pending'))

  const result = await sweepAwaitingPayments()

  assert.equal(getOrder(order.id)!.state, 'awaiting_payment')
  assert.equal(result.pending, 1)
})

test('an order with no providerRef yet is skipped without calling the provider', async () => {
  awaitingPaymentOrder(undefined)
  const provider = fakeProvider('paid')
  __setProviderForTests('counter', provider)

  const result = await sweepAwaitingPayments()

  assert.equal(provider.calls.length, 0)
  assert.equal(result.pending, 1)
})

test('a stale order expires without ever reaching the provider', async () => {
  __setAwaitingPaymentExpiryMsForTests(10)
  const order = awaitingPaymentOrder('ref-1')
  const provider = fakeProvider('paid')
  __setProviderForTests('counter', provider)

  const start = Date.now()
  while (Date.now() - start < 20) {
    /* busy-wait past the 10ms test expiry — fast and deterministic */
  }

  const result = await sweepAwaitingPayments()

  assert.equal(provider.calls.length, 0)
  assert.equal(result.checked, 0)
  assert.equal(getOrder(order.id)!.state, 'payment_failed')
})

test('running the sweep concurrently on the same order applies only one transition', async () => {
  const order = awaitingPaymentOrder('ref-1')
  __setProviderForTests('counter', fakeProvider('paid'))

  await Promise.all([sweepAwaitingPayments(), sweepAwaitingPayments()])

  assert.equal(getOrder(order.id)!.state, 'paid')
  const paidEvents = getOrderEvents(order.id).filter((event) => event.toState === 'paid')
  assert.equal(paidEvents.length, 1)
})
