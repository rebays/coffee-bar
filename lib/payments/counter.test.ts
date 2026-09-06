import { test } from 'node:test'
import assert from 'node:assert/strict'

import { __resetOrderStoreForTests, createOrder, transitionOrder } from '../orders/store.ts'
import type { OrderActor, OrderLine } from '../orders/types.ts'
import { CounterProvider } from './counter.ts'

const CUSTOMER: OrderActor = { type: 'customer', deviceToken: 'device-1' }

const LINES: OrderLine[] = [
  { slug: 'flat-white', name: 'Flat white', customizations: [], quantity: 1, unitPrice: 3800, lineTotal: 3800 },
]

test.beforeEach(() => {
  __resetOrderStoreForTests()
})

test('initiate issues a counter instruction with the order\'s pickup code and total', async () => {
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: 'device-1', lines: LINES },
    'idem-1',
    CUSTOMER,
  )

  const { providerRef, instruction } = await CounterProvider.initiate(order)

  assert.equal(providerRef, order.id)
  assert.deepEqual(instruction, {
    kind: 'counter',
    pickupCode: order.pickupCode,
    amount: order.total,
  })
})

test('reconcile reflects the order\'s own state rather than a separate record', async () => {
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: 'device-1', lines: LINES },
    'idem-1',
    CUSTOMER,
  )

  assert.equal(await CounterProvider.reconcile(order.id), 'pending')

  transitionOrder(order.id, 'awaiting_payment', { type: 'system' })
  assert.equal(await CounterProvider.reconcile(order.id), 'pending')

  transitionOrder(order.id, 'paid', { type: 'staff', staffId: 's1' })
  assert.equal(await CounterProvider.reconcile(order.id), 'paid')

  transitionOrder(order.id, 'making', { type: 'staff', staffId: 's1' })
  assert.equal(await CounterProvider.reconcile(order.id), 'paid', 'later kitchen states still read as paid')
})

test('reconcile reports failed for a cancelled or payment-failed order', async () => {
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: 'device-1', lines: LINES },
    'idem-1',
    CUSTOMER,
  )
  transitionOrder(order.id, 'cancelled', { type: 'staff', staffId: 's1' })

  assert.equal(await CounterProvider.reconcile(order.id), 'failed')
})

test('reconcile is pending, not an error, for an unknown provider ref', async () => {
  assert.equal(await CounterProvider.reconcile('no-such-order'), 'pending')
})
