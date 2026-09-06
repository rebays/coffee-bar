import { test } from 'node:test'
import assert from 'node:assert/strict'

import { addToCart, clearCart, getCartLines, resolveLine } from './cart-store.ts'

test.beforeEach(() => {
  clearCart()
})

test('the same drink with different milk produces two lines', () => {
  addToCart('flat-white', { size: 'regular', milk: 'whole', shots: 'none' })
  addToCart('flat-white', { size: 'regular', milk: 'oat', shots: 'none' })

  assert.equal(getCartLines().length, 2)
})

test('the same drink and milk twice produces one line at quantity 2', () => {
  addToCart('flat-white', { size: 'regular', milk: 'oat', shots: 'none' })
  addToCart('flat-white', { size: 'regular', milk: 'oat', shots: 'none' })

  const lines = getCartLines()
  assert.equal(lines.length, 1)
  assert.equal(lines[0].quantity, 2)
})

test('merging is order-independent in how the choices object is built', () => {
  addToCart('flat-white', { size: 'regular', milk: 'oat', shots: 'none' })
  addToCart('flat-white', { shots: 'none', milk: 'oat', size: 'regular' })

  const lines = getCartLines()
  assert.equal(lines.length, 1)
  assert.equal(lines[0].quantity, 2)
})

test('addToCart accumulates an explicit quantity, not just +1', () => {
  addToCart('flat-white', { size: 'regular', milk: 'whole', shots: 'none' }, 3)
  addToCart('flat-white', { size: 'regular', milk: 'whole', shots: 'none' }, 2)

  const lines = getCartLines()
  assert.equal(lines.length, 1)
  assert.equal(lines[0].quantity, 5)
})

test('the total is correct to the cent', () => {
  // Flat white $38.00 + Large $9.00 + Oat $8.00 = $55.00, quantity 2 = $110.00
  addToCart('flat-white', { size: 'large', milk: 'oat', shots: 'none' }, 2)
  const resolved = resolveLine(getCartLines()[0])!

  assert.equal(resolved.unitPrice, 5500)
  assert.equal(resolved.lineTotal, 11000)
})

test('resolveLine surfaces only the choices that differ from default', () => {
  addToCart('flat-white', { size: 'large', milk: 'whole', shots: 'none' })
  const resolved = resolveLine(getCartLines()[0])!

  assert.deepEqual(resolved.customizations, ['Large'])
})

test('resolveLine returns null for a line whose item no longer exists', () => {
  addToCart('flat-white', { size: 'regular', milk: 'whole', shots: 'none' })
  const line = { ...getCartLines()[0], slug: 'no-such-item' }

  assert.equal(resolveLine(line), null)
})
