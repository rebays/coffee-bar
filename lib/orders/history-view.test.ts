import { test } from 'node:test'
import assert from 'node:assert/strict'

import { historyStateLabel, toHistoryView } from './history-view.ts'
import { __resetOrderStoreForTests, createOrder } from './store.ts'
import type { OrderActor, OrderLine } from './types.ts'

const CUSTOMER: OrderActor = { type: 'customer', deviceToken: 'super-secret-device-token' }
const LINES: OrderLine[] = [
  {
    slug: 'flat-white',
    name: 'Flat white',
    customizations: ['Oat'],
    quantity: 2,
    unitPrice: 3800,
    lineTotal: 7600,
    choices: { size: 'regular', milk: 'oat' },
  },
]

test.beforeEach(() => {
  __resetOrderStoreForTests()
})

test('the history view never carries the device token', () => {
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: CUSTOMER.deviceToken, lines: LINES },
    'idem-1',
    CUSTOMER,
  )

  const view = toHistoryView(order)

  assert.equal('deviceToken' in view, false)
  assert.equal(JSON.stringify(view).includes('super-secret-device-token'), false)
})

test('reorderLines carries the raw choice ids back out for addToCart', () => {
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: CUSTOMER.deviceToken, lines: LINES },
    'idem-1',
    CUSTOMER,
  )

  const view = toHistoryView(order)

  assert.deepEqual(view.reorderLines, [
    { slug: 'flat-white', choices: { size: 'regular', milk: 'oat' }, quantity: 2 },
  ])
})

test('a line placed before choices existed reorders with an empty choice set, not a crash', () => {
  const legacyLines: OrderLine[] = [
    { slug: 'flat-white', name: 'Flat white', customizations: [], quantity: 1, unitPrice: 3800, lineTotal: 3800 },
  ]
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: CUSTOMER.deviceToken, lines: legacyLines },
    'idem-1',
    CUSTOMER,
  )

  const view = toHistoryView(order)

  assert.deepEqual(view.reorderLines, [{ slug: 'flat-white', choices: {}, quantity: 1 }])
})

test('history state labels match the customer-facing tracker vocabulary', () => {
  assert.equal(historyStateLabel('placed'), 'Sent')
  assert.equal(historyStateLabel('awaiting_payment'), 'Sent')
  assert.equal(historyStateLabel('paid'), 'Sent')
  assert.equal(historyStateLabel('making'), 'Making')
  assert.equal(historyStateLabel('ready'), 'Ready')
  assert.equal(historyStateLabel('collected'), 'Collected')
  assert.equal(historyStateLabel('payment_failed'), 'Payment failed')
  assert.equal(historyStateLabel('cancelled'), 'Cancelled')
})
