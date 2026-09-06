import { test } from 'node:test'
import assert from 'node:assert/strict'

import { __resetOrderStoreForTests, createOrder } from './store.ts'
import { displayStepIndex, toStatusView } from './status-view.ts'
import type { OrderActor, OrderLine } from './types.ts'

const CUSTOMER: OrderActor = { type: 'customer', deviceToken: 'super-secret-device-token' }
const LINES: OrderLine[] = [
  { slug: 'flat-white', name: 'Flat white', customizations: [], quantity: 1, unitPrice: 3800, lineTotal: 3800 },
]

test.beforeEach(() => {
  __resetOrderStoreForTests()
})

test('the status view never carries the device token', () => {
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: CUSTOMER.deviceToken, lines: LINES },
    'idem-1',
    CUSTOMER,
  )

  const view = toStatusView(order)

  assert.equal('deviceToken' in view, false)
  assert.equal(JSON.stringify(view).includes('super-secret-device-token'), false)
})

test('the status view carries what the customer needs to see', () => {
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: CUSTOMER.deviceToken, lines: LINES },
    'idem-1',
    CUSTOMER,
  )

  const view = toStatusView(order)

  assert.equal(view.id, order.id)
  assert.equal(view.pickupCode, order.pickupCode)
  assert.equal(view.total, 3800)
  assert.equal(view.state, 'placed')
  assert.deepEqual(view.lines, order.lines)
})

test('placed, awaiting_payment and paid all display as the same first step', () => {
  assert.equal(displayStepIndex('placed'), 0)
  assert.equal(displayStepIndex('awaiting_payment'), 0)
  assert.equal(displayStepIndex('paid'), 0)
})

test('making, ready and collected each get their own step', () => {
  assert.equal(displayStepIndex('making'), 1)
  assert.equal(displayStepIndex('ready'), 2)
  assert.equal(displayStepIndex('collected'), 3)
})

test('payment_failed and cancelled are not part of the tracker', () => {
  assert.equal(displayStepIndex('payment_failed'), null)
  assert.equal(displayStepIndex('cancelled'), null)
})
