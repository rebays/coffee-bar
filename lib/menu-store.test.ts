import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MENU } from './fixtures.ts'
import type { MenuItemFields } from './menu-item-input.ts'
import {
  __resetMenuStoreForTests,
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  getMenuItems,
  reorderMenuItem,
  setSoldOut,
  updateMenuItem,
} from './menu-store.ts'

test.beforeEach(() => {
  __resetMenuStoreForTests()
})

function fields(overrides: Partial<MenuItemFields> = {}): MenuItemFields {
  return {
    name: 'Espresso tonic',
    description: 'A shot over tonic, built on ice.',
    spec: '1 shot · 250ml · tonic',
    category: 'cold',
    basePrice: 4200,
    tags: ['Dairy free'],
    optionGroupIds: ['size'],
    ...overrides,
  }
}

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

test('createMenuItem generates a URL-safe slug from the name', () => {
  const item = createMenuItem(fields({ name: 'Espresso Tonic!' }))
  assert.equal(item.slug, 'espresso-tonic')
  assert.equal(getMenuItem('espresso-tonic')?.name, 'Espresso Tonic!')
})

test('createMenuItem dedupes a colliding slug', () => {
  const first = createMenuItem(fields({ name: 'Flat White' }))
  assert.notEqual(first.slug, 'flat-white', 'the fixture already owns this slug')
  assert.equal(first.slug, 'flat-white-2')

  const second = createMenuItem(fields({ name: 'Flat White' }))
  assert.equal(second.slug, 'flat-white-3')
})

test('a new item starts available and lands at the end of its category block', () => {
  const item = createMenuItem(fields({ category: 'espresso' }))
  assert.equal(item.soldOut, false)

  const espressoSlugs = getMenuItems()
    .filter((menuItem) => menuItem.category === 'espresso')
    .map((menuItem) => menuItem.slug)
  assert.equal(espressoSlugs.at(-1), item.slug)
})

test('a new item in a category placed correctly relative to other categories', () => {
  const item = createMenuItem(fields({ category: 'cold' }))
  const slugs = getMenuItems().map((menuItem) => menuItem.slug)
  const coldSlugs = MENU.filter((m) => m.category === 'cold').map((m) => m.slug)
  const lastColdIndex = slugs.indexOf(coldSlugs.at(-1)!)
  const notCoffeeFirstIndex = slugs.indexOf(MENU.find((m) => m.category === 'other')!.slug)

  const newIndex = slugs.indexOf(item.slug)
  assert.ok(newIndex > lastColdIndex, 'sits after the last existing cold item')
  assert.ok(newIndex < notCoffeeFirstIndex, 'sits before the next category')
})

test('updateMenuItem replaces every editable field but preserves slug and soldOut', () => {
  setSoldOut('flat-white', true)
  const updated = updateMenuItem('flat-white', fields({ name: 'Flat White Deluxe', basePrice: 4000 }))

  assert.equal(updated?.slug, 'flat-white', 'slug is immutable')
  assert.equal(updated?.soldOut, true, 'soldOut is untouched by an edit')
  assert.equal(updated?.name, 'Flat White Deluxe')
  assert.equal(updated?.basePrice, 4000)
})

test('updateMenuItem on an unknown slug is a no-op that returns undefined', () => {
  assert.equal(updateMenuItem('does-not-exist', fields()), undefined)
})

test('updateMenuItem repositions the item when its category changes', () => {
  updateMenuItem('flat-white', fields({ category: 'food' }))
  const slugs = getMenuItems().map((item) => item.slug)
  const foodSlugs = MENU.filter((m) => m.category === 'food').map((m) => m.slug)

  assert.ok(
    slugs.indexOf('flat-white') > slugs.indexOf(foodSlugs.at(-1)!),
    'moved item lands at the end of its new category block',
  )
})

test('deleteMenuItem removes the item from both lookup and order', () => {
  assert.equal(deleteMenuItem('flat-white'), true)
  assert.equal(getMenuItem('flat-white'), undefined)
  assert.equal(getMenuItems().some((item) => item.slug === 'flat-white'), false)
})

test('deleteMenuItem on an unknown slug returns false and changes nothing', () => {
  const before = getMenuItems().length
  assert.equal(deleteMenuItem('does-not-exist'), false)
  assert.equal(getMenuItems().length, before)
})

test('reorderMenuItem swaps with its neighbour within the same category', () => {
  const before = getMenuItems()
    .filter((item) => item.category === 'espresso')
    .map((item) => item.slug)

  reorderMenuItem(before[1], 'up')

  const after = getMenuItems()
    .filter((item) => item.category === 'espresso')
    .map((item) => item.slug)

  assert.equal(after[0], before[1])
  assert.equal(after[1], before[0])
})

test('reorderMenuItem is a no-op at the edge of its category block', () => {
  const espressoSlugs = getMenuItems()
    .filter((item) => item.category === 'espresso')
    .map((item) => item.slug)

  const beforeAll = getMenuItems().map((item) => item.slug)
  reorderMenuItem(espressoSlugs[0], 'up') // already first in its category
  assert.deepEqual(getMenuItems().map((item) => item.slug), beforeAll)

  const lastEspresso = espressoSlugs.at(-1)!
  reorderMenuItem(lastEspresso, 'down') // would cross into the next category
  assert.deepEqual(getMenuItems().map((item) => item.slug), beforeAll)
})

test('reorderMenuItem on an unknown slug is a no-op', () => {
  const before = getMenuItems().map((item) => item.slug)
  reorderMenuItem('does-not-exist', 'up')
  assert.deepEqual(getMenuItems().map((item) => item.slug), before)
})
