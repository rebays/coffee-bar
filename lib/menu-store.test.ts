import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MENU } from './fixtures.ts'
import { __resetMenuStoreForTests, getMenuItem, getMenuItems, setSoldOut } from './menu-store.ts'

test.beforeEach(() => {
  __resetMenuStoreForTests()
})

test('getMenuItems starts seeded from the fixtures, in fixture order', () => {
  const items = getMenuItems()
  assert.equal(items.length, MENU.length)
  assert.deepEqual(items.map((item) => item.slug), MENU.map((item) => item.slug))
})

test('getMenuItem finds by slug and returns undefined otherwise', () => {
  assert.equal(getMenuItem('flat-white')?.name, 'Flat white')
  assert.equal(getMenuItem('does-not-exist'), undefined)
})

test('setSoldOut flips the flag without touching the fixture or other fields', () => {
  const before = getMenuItem('flat-white')!
  assert.equal(before.soldOut, undefined)

  const updated = setSoldOut('flat-white', true)
  assert.equal(updated?.soldOut, true)
  assert.equal(getMenuItem('flat-white')?.soldOut, true)
  assert.equal(MENU.find((item) => item.slug === 'flat-white')?.soldOut, undefined, 'fixtures are immutable')

  const restored = setSoldOut('flat-white', false)
  assert.equal(restored?.soldOut, false)
  assert.equal(updated?.name, before.name, 'only soldOut changes')
})

test('setSoldOut on an unknown slug is a no-op that returns undefined', () => {
  assert.equal(setSoldOut('does-not-exist', true), undefined)
})

test('an item already sold out in fixtures starts that way', () => {
  assert.equal(getMenuItem('filter-png-sigri')?.soldOut, true)
})

test('__resetMenuStoreForTests clears any toggles made since', () => {
  setSoldOut('flat-white', true)
  __resetMenuStoreForTests()
  assert.equal(getMenuItem('flat-white')?.soldOut, undefined)
})
