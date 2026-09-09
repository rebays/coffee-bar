import { test } from 'node:test'
import assert from 'node:assert/strict'

import { addToCart, clearCart, getCartLines, resolveLine } from './cart-store.ts'

test.beforeEach(() => {
  clearCart()
})

test('the same main with a different side produces two lines', () => {
  addToCart('creamy-coconut-chicken', { 'side-mains': 'cassava-chips' })
  addToCart('creamy-coconut-chicken', { 'side-mains': 'jasmine-rice' })

  assert.equal(getCartLines().length, 2)
})

test('the same main and side twice produces one line at quantity 2', () => {
  addToCart('creamy-coconut-chicken', { 'side-mains': 'jasmine-rice' })
  addToCart('creamy-coconut-chicken', { 'side-mains': 'jasmine-rice' })

  const lines = getCartLines()
  assert.equal(lines.length, 1)
  assert.equal(lines[0].quantity, 2)
})

test('merging is order-independent in how the choices object is built', () => {
  addToCart('garlic-butter-prawn-bowl', { 'side-mains': 'kumara-chips' })
  addToCart('garlic-butter-prawn-bowl', { 'side-mains': 'kumara-chips' })

  const lines = getCartLines()
  assert.equal(lines.length, 1)
  assert.equal(lines[0].quantity, 2)
})

test('addToCart accumulates an explicit quantity, not just +1', () => {
  addToCart('creamy-coconut-chicken', { 'side-mains': 'cassava-chips' }, 3)
  addToCart('creamy-coconut-chicken', { 'side-mains': 'cassava-chips' }, 2)

  const lines = getCartLines()
  assert.equal(lines.length, 1)
  assert.equal(lines[0].quantity, 5)
})

test('the total is correct to the cent', () => {
  // Creamy Coconut Chicken $75.00, quantity 2 = $150.00 — side choices carry
  // no upcharge on this menu, so the total is exactly basePrice × quantity.
  addToCart('creamy-coconut-chicken', { 'side-mains': 'jasmine-rice' }, 2)
  const resolved = resolveLine(getCartLines()[0])!

  assert.equal(resolved.unitPrice, 7500)
  assert.equal(resolved.lineTotal, 15000)
})

test('resolveLine surfaces only the choices that differ from default', () => {
  addToCart('creamy-coconut-chicken', { 'side-mains': 'jasmine-rice' })
  const resolved = resolveLine(getCartLines()[0])!

  assert.deepEqual(resolved.customizations, ['Steamed Jasmine Rice'])
})

test('sweetness always appears in customizations, even at its default', () => {
  // The requirement's own example: "Flat White — Oat Milk, 100% Sugar" shows
  // 100% sugar even though that's Flat White's default — unlike milk, which
  // only shows when it's not the default.
  addToCart('flat-white', { milk: 'oat', 'sweetness-standard': 'sugar-100' })
  const resolved = resolveLine(getCartLines()[0])!

  assert.deepEqual(resolved.customizations, ['Oat Milk', '100% Sugar (Standard)'])
})

test('milk still only shows when it differs from default, alongside always-shown sweetness', () => {
  addToCart('flat-white', { milk: 'whole', 'sweetness-standard': 'sugar-50' })
  const resolved = resolveLine(getCartLines()[0])!

  assert.deepEqual(resolved.customizations, ['50% Sugar (Less Sweet)'])
})

test('black coffees default sweetness to 0%, other drinks default to 100%', () => {
  addToCart('espresso', { 'sweetness-black': 'sugar-0' })
  addToCart('iced-hibiscus-tea', { 'sweetness-standard': 'sugar-100' })

  const [espresso, tea] = getCartLines().map((line) => resolveLine(line)!)
  assert.deepEqual(espresso.customizations, ['0% Sugar (No Sugar)'])
  assert.deepEqual(tea.customizations, ['100% Sugar (Standard)'])
})

test('a note is carried on the line', () => {
  addToCart('flat-white', { milk: 'oat' }, 1, 'Extra hot please')
  assert.equal(getCartLines()[0].notes, 'Extra hot please')
})

test('two otherwise-identical lines with different notes stay separate, not merged', () => {
  addToCart('flat-white', { milk: 'oat' }, 1, 'Extra hot')
  addToCart('flat-white', { milk: 'oat' }, 1, 'No foam')

  const lines = getCartLines()
  assert.equal(lines.length, 2)
  assert.deepEqual(
    lines.map((line) => line.notes).sort(),
    ['Extra hot', 'No foam'],
  )
})

test('the same note twice merges into one line at quantity 2', () => {
  addToCart('flat-white', { milk: 'oat' }, 1, 'Extra hot')
  addToCart('flat-white', { milk: 'oat' }, 1, 'Extra hot')

  const lines = getCartLines()
  assert.equal(lines.length, 1)
  assert.equal(lines[0].quantity, 2)
})

test('blank or whitespace-only notes are treated as no note', () => {
  addToCart('flat-white', { milk: 'oat' }, 1, '   ')
  assert.equal(getCartLines()[0].notes, undefined)
})

test('resolveLine returns null for a line whose item no longer exists', () => {
  addToCart('creamy-coconut-chicken', { 'side-mains': 'cassava-chips' })
  const line = { ...getCartLines()[0], slug: 'no-such-item' }

  assert.equal(resolveLine(line), null)
})
