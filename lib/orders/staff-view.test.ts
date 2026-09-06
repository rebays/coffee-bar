import { test } from 'node:test'
import assert from 'node:assert/strict'

import { canTransition } from './state-machine.ts'
import { __resetOrderStoreForTests, createOrder } from './store.ts'
import { STAFF_ACTION_TARGET_STATE, staffActionsForState, toStaffOrderView } from './staff-view.ts'
import type { OrderActor, OrderLine } from './types.ts'

const CUSTOMER: OrderActor = { type: 'customer', deviceToken: 'super-secret-device-token' }
const LINES: OrderLine[] = [
  { slug: 'flat-white', name: 'Flat white', customizations: [], quantity: 1, unitPrice: 3800, lineTotal: 3800 },
]

test.beforeEach(() => {
  __resetOrderStoreForTests()
})

test('the staff view never carries the device token', () => {
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: CUSTOMER.deviceToken, lines: LINES },
    'idem-1',
    CUSTOMER,
  )

  const view = toStaffOrderView(order)

  assert.equal('deviceToken' in view, false)
  assert.equal(JSON.stringify(view).includes('super-secret-device-token'), false)
})

test('the staff view carries what the dashboard needs', () => {
  const order = createOrder(
    { shopId: 'honiara', providerId: 'counter', deviceToken: CUSTOMER.deviceToken, lines: LINES },
    'idem-1',
    CUSTOMER,
  )

  const view = toStaffOrderView(order)

  assert.equal(view.id, order.id)
  assert.equal(view.pickupCode, order.pickupCode)
  assert.equal(view.total, 3800)
  assert.equal(view.state, 'placed')
  assert.equal(view.createdAt, order.createdAt)
  assert.deepEqual(view.lines, order.lines)
})

test('start_making is hidden from awaiting_payment unless the flag is on', () => {
  const withoutFlag = staffActionsForState('awaiting_payment', false).map((a) => a.action)
  assert.equal(withoutFlag.includes('start_making'), false)

  const withFlag = staffActionsForState('awaiting_payment', true).map((a) => a.action)
  assert.equal(withFlag.includes('start_making'), true)
})

test('every action a state offers matches a real state-machine edge', () => {
  const states = ['awaiting_payment', 'paid', 'making', 'ready'] as const
  for (const state of states) {
    for (const spec of staffActionsForState(state, true)) {
      const target = STAFF_ACTION_TARGET_STATE[spec.action]
      assert.equal(
        canTransition(state, target, { startMakingBeforePayment: true }),
        true,
        `${spec.action} from ${state} -> ${target} should be a legal transition`,
      )
    }
  }
})

test('collected and cancelled offer no further staff actions', () => {
  assert.deepEqual(staffActionsForState('collected', false), [])
  assert.deepEqual(staffActionsForState('cancelled', false), [])
  assert.deepEqual(staffActionsForState('payment_failed', false), [])
})
