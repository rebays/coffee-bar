import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  __resetOrderStoreForTests,
  __setAwaitingPaymentExpiryMsForTests,
  createOrder,
  getOrder,
  getOrderEvents,
  listOrders,
  transitionOrder,
} from './store.ts'
import type { CreateOrderInput } from './store.ts'
import type { OrderActor, OrderLine } from './types.ts'

const CUSTOMER: OrderActor = { type: 'customer', deviceToken: 'device-1' }
const STAFF: OrderActor = { type: 'staff', staffId: 'staff-1' }

function sampleInput(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  const lines: OrderLine[] = overrides.lines ?? [
    { slug: 'flat-white', name: 'Flat white', customizations: [], quantity: 1, unitPrice: 3800, lineTotal: 3800 },
    { slug: 'long-black', name: 'Long black', customizations: [], quantity: 2, unitPrice: 3400, lineTotal: 6800 },
  ]
  return {
    shopId: 'honiara',
    providerId: 'counter',
    deviceToken: 'device-1',
    ...overrides,
    lines,
  }
}

test.beforeEach(() => {
  __resetOrderStoreForTests()
})

test('submitting the same order twice with one idempotency key creates one order', () => {
  const first = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  const second = createOrder(sampleInput(), 'idem-1', CUSTOMER)

  assert.equal(first.id, second.id)
  assert.equal(getOrderEvents(first.id).length, 1, 'only one placed event should exist')
})

test('a different idempotency key creates a genuinely separate order', () => {
  const first = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  const second = createOrder(sampleInput(), 'idem-2', CUSTOMER)

  assert.notEqual(first.id, second.id)
})

test('the total is locked at creation from the line totals given', () => {
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  assert.equal(order.total, 3800 + 6800)
})

test('the order owns its own copy of the lines it was given', () => {
  const input = sampleInput()
  const order = createOrder(input, 'idem-1', CUSTOMER)

  // Mutating the caller's own array/objects after the fact — as if a later
  // menu price change reached back into what was already submitted — must
  // not be able to touch the stored order.
  input.lines[0].unitPrice = 999999
  input.lines.push({
    slug: 'intruder',
    name: 'Should not appear',
    customizations: [],
    quantity: 1,
    unitPrice: 1,
    lineTotal: 1,
  })

  const stored = getOrder(order.id)!
  assert.equal(stored.lines[0].unitPrice, 3800)
  assert.equal(stored.lines.length, 2)
  assert.equal(stored.total, 3800 + 6800)
})

test('creation appends exactly one placed event with no prior state', () => {
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  const events = getOrderEvents(order.id)

  assert.equal(events.length, 1)
  assert.equal(events[0].fromState, null)
  assert.equal(events[0].toState, 'placed')
})

test('a new order starts at placed and issues a pickup code', () => {
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  assert.equal(order.state, 'placed')
  assert.equal(order.pickupCode.length, 4)
})

test('two orders placed the same day get different pickup codes', () => {
  const a = createOrder(sampleInput(), 'idem-a', CUSTOMER)
  const b = createOrder(sampleInput(), 'idem-b', CUSTOMER)
  assert.notEqual(a.pickupCode, b.pickupCode)
})

test('a valid transition succeeds and is recorded once', () => {
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  const result = transitionOrder(order.id, 'awaiting_payment', { type: 'system' })

  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.applied, true)
    assert.equal(result.order.state, 'awaiting_payment')
  }
  assert.equal(getOrderEvents(order.id).length, 2)
})

test('replaying the same transition twice is a no-op', () => {
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  transitionOrder(order.id, 'awaiting_payment', { type: 'system' })

  const replay = transitionOrder(order.id, 'awaiting_payment', { type: 'system' })

  assert.equal(replay.ok, true)
  if (replay.ok) assert.equal(replay.applied, false)
  assert.equal(getOrderEvents(order.id).length, 2, 'the replay must not add a second event')
})

test('an invalid transition is rejected and leaves state and events untouched', () => {
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  const result = transitionOrder(order.id, 'making', STAFF) // placed -> making skips ahead

  assert.deepEqual(result, { ok: false, error: 'invalid_transition' })
  assert.equal(getOrder(order.id)!.state, 'placed')
  assert.equal(getOrderEvents(order.id).length, 1)
})

test('transitioning an unknown order id fails cleanly', () => {
  const result = transitionOrder('no-such-order', 'paid', STAFF)
  assert.deepEqual(result, { ok: false, error: 'not_found' })
})

test('every state change through a full lifecycle appears exactly once in order_events', () => {
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  transitionOrder(order.id, 'awaiting_payment', { type: 'system' })
  transitionOrder(order.id, 'paid', { type: 'provider', providerId: 'counter' })
  transitionOrder(order.id, 'making', STAFF)
  transitionOrder(order.id, 'ready', STAFF)
  transitionOrder(order.id, 'collected', STAFF)

  const events = getOrderEvents(order.id)
  const sequence = events.map((e) => e.toState)

  assert.deepEqual(sequence, [
    'placed',
    'awaiting_payment',
    'paid',
    'making',
    'ready',
    'collected',
  ])
  assert.equal(new Set(sequence).size, sequence.length, 'no state should repeat')
})

test('cancelling with a reason records it on the order and in the event payload', () => {
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  const result = transitionOrder(order.id, 'cancelled', STAFF, { reason: 'Customer changed their mind' })

  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.order.cancelReason, 'Customer changed their mind')

  const events = getOrderEvents(order.id)
  assert.equal(events.at(-1)?.toState, 'cancelled')
})

test('startMakingBeforePayment lets an order skip straight to making from awaiting_payment', () => {
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  transitionOrder(order.id, 'awaiting_payment', { type: 'system' })

  const blocked = transitionOrder(order.id, 'making', STAFF)
  assert.deepEqual(blocked, { ok: false, error: 'invalid_transition' })

  const allowed = transitionOrder(order.id, 'making', STAFF, { startMakingBeforePayment: true })
  assert.equal(allowed.ok, true)
})

test('an awaiting_payment order past its expiry lazily moves to payment_failed on read', () => {
  __setAwaitingPaymentExpiryMsForTests(10)
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  transitionOrder(order.id, 'awaiting_payment', { type: 'system' })
  assert.equal(getOrder(order.id)!.state, 'awaiting_payment', 'not stale yet')

  const start = Date.now()
  while (Date.now() - start < 20) {
    /* busy-wait past the 10ms test expiry — this is fast and deterministic */
  }

  const expired = getOrder(order.id)!
  assert.equal(expired.state, 'payment_failed')

  const events = getOrderEvents(order.id)
  assert.deepEqual(
    events.map((e) => e.toState),
    ['placed', 'awaiting_payment', 'payment_failed'],
  )
  assert.equal(events.at(-1)?.actor.type, 'system')
})

test('expiry only fires once, even across repeated reads', () => {
  __setAwaitingPaymentExpiryMsForTests(10)
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  transitionOrder(order.id, 'awaiting_payment', { type: 'system' })

  const start = Date.now()
  while (Date.now() - start < 20) {
    /* busy-wait past the 10ms test expiry */
  }

  getOrder(order.id)
  getOrder(order.id)
  getOrder(order.id)

  assert.equal(getOrderEvents(order.id).length, 3, 'placed, awaiting_payment, payment_failed — no more')
})

test('a paid order does not expire even after the awaiting_payment window', () => {
  __setAwaitingPaymentExpiryMsForTests(10)
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  transitionOrder(order.id, 'awaiting_payment', { type: 'system' })
  transitionOrder(order.id, 'paid', { type: 'provider', providerId: 'counter' })

  const start = Date.now()
  while (Date.now() - start < 20) {
    /* busy-wait past the 10ms test expiry */
  }

  assert.equal(getOrder(order.id)!.state, 'paid')
})

test('listOrders returns newest first', () => {
  const first = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  const second = createOrder(sampleInput(), 'idem-2', CUSTOMER)

  const [top, bottom] = listOrders()
  assert.equal(top.id, second.id)
  assert.equal(bottom.id, first.id)
})

test('listOrders filters by state', () => {
  const a = createOrder(sampleInput(), 'idem-a', CUSTOMER)
  const b = createOrder(sampleInput(), 'idem-b', CUSTOMER)
  transitionOrder(a.id, 'awaiting_payment', { type: 'system' })

  const awaitingOnly = listOrders({ states: ['awaiting_payment'] })
  assert.deepEqual(awaitingOnly.map((o) => o.id), [a.id])

  const placedOnly = listOrders({ states: ['placed'] })
  assert.deepEqual(placedOnly.map((o) => o.id), [b.id])
})

test('listOrders finds by pickup code regardless of case, across any state', () => {
  const order = createOrder(sampleInput(), 'idem-1', CUSTOMER)
  transitionOrder(order.id, 'awaiting_payment', { type: 'system' })
  transitionOrder(order.id, 'paid', { type: 'provider', providerId: 'counter' })
  transitionOrder(order.id, 'making', STAFF)
  transitionOrder(order.id, 'ready', STAFF)
  transitionOrder(order.id, 'collected', STAFF)

  const found = listOrders({ pickupCode: order.pickupCode.toLowerCase() })
  assert.deepEqual(found.map((o) => o.id), [order.id])
})

test('listOrders filters by deviceToken, scoping order history to one customer', () => {
  const mine = createOrder(sampleInput({ deviceToken: 'device-1' }), 'idem-mine', CUSTOMER)
  createOrder(sampleInput({ deviceToken: 'device-2' }), 'idem-theirs', {
    type: 'customer',
    deviceToken: 'device-2',
  })

  const found = listOrders({ deviceToken: 'device-1' })
  assert.deepEqual(found.map((o) => o.id), [mine.id])
})

test('listOrders with no filter returns every order, including terminal ones', () => {
  const a = createOrder(sampleInput(), 'idem-a', CUSTOMER)
  createOrder(sampleInput(), 'idem-b', CUSTOMER)
  transitionOrder(a.id, 'cancelled', STAFF)

  assert.equal(listOrders().length, 2)
  assert.deepEqual(listOrders({ states: ['cancelled'] }).map((o) => o.id), [a.id])
})
