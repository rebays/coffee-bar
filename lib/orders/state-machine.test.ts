import { test } from 'node:test'
import assert from 'node:assert/strict'

import { allowedTransitions, canTransition } from './state-machine.ts'

test('the happy path is allowed end to end', () => {
  assert.ok(canTransition('placed', 'awaiting_payment'))
  assert.ok(canTransition('awaiting_payment', 'paid'))
  assert.ok(canTransition('paid', 'making'))
  assert.ok(canTransition('making', 'ready'))
  assert.ok(canTransition('ready', 'collected'))
})

test('payment can fail from awaiting_payment, then cancel', () => {
  assert.ok(canTransition('awaiting_payment', 'payment_failed'))
  assert.ok(canTransition('payment_failed', 'cancelled'))
})

test('cancellation is reachable from every pre-fulfillment state', () => {
  for (const from of ['placed', 'awaiting_payment', 'paid', 'making'] as const) {
    assert.ok(canTransition(from, 'cancelled'), `${from} -> cancelled should be allowed`)
  }
})

test('ready and collected cannot be cancelled', () => {
  assert.equal(canTransition('ready', 'cancelled'), false)
  assert.equal(canTransition('collected', 'cancelled'), false)
})

test('collected and cancelled are terminal', () => {
  assert.deepEqual(allowedTransitions('collected'), [])
  assert.deepEqual(allowedTransitions('cancelled'), [])
})

test('no state can jump ahead of the sequence', () => {
  assert.equal(canTransition('placed', 'paid'), false)
  assert.equal(canTransition('placed', 'making'), false)
  assert.equal(canTransition('awaiting_payment', 'ready'), false)
  assert.equal(canTransition('paid', 'ready'), false)
  assert.equal(canTransition('paid', 'collected'), false)
})

test('nothing can move backward', () => {
  assert.equal(canTransition('paid', 'awaiting_payment'), false)
  assert.equal(canTransition('making', 'paid'), false)
  assert.equal(canTransition('ready', 'making'), false)
})

test('startMakingBeforePayment only widens awaiting_payment, off by default', () => {
  assert.equal(canTransition('awaiting_payment', 'making'), false)
  assert.ok(canTransition('awaiting_payment', 'making', { startMakingBeforePayment: true }))

  // The flag doesn't touch any other edge.
  assert.equal(canTransition('placed', 'making', { startMakingBeforePayment: true }), false)
  assert.ok(canTransition('awaiting_payment', 'paid', { startMakingBeforePayment: true }))
})
