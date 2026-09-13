import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  __resetCategoryStoreForTests,
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  renameCategory,
} from './category-store.ts'

test.beforeEach(() => {
  __resetCategoryStoreForTests()
})

test('getCategories starts seeded with the original taxonomy, in order', () => {
  const categories = getCategories()
  assert.equal(categories.length, 8)
  assert.equal(categories[0].id, 'best-sellers')
  assert.equal(categories.at(-1)!.id, 'bakery-desserts')
})

test('getCategory finds by id and returns undefined otherwise', () => {
  assert.equal(getCategory('coffee')?.label, 'Coffee')
  assert.equal(getCategory('nonexistent'), undefined)
})

test('createCategory slugifies the label into an id and appends to the end', () => {
  const created = createCategory('Late Night Snacks')
  assert.equal(created.id, 'late-night-snacks')
  assert.equal(getCategories().at(-1), created)
})

test('createCategory dedupes ids that would otherwise collide', () => {
  const first = createCategory('Specials')
  const second = createCategory('Specials')
  assert.equal(first.id, 'specials')
  assert.equal(second.id, 'specials-2')
})

test('renameCategory changes the label but keeps the id stable', () => {
  const updated = renameCategory('coffee', 'Espresso Bar')
  assert.equal(updated?.id, 'coffee')
  assert.equal(updated?.label, 'Espresso Bar')
  assert.equal(getCategory('coffee')?.label, 'Espresso Bar')
})

test('renameCategory returns undefined for an unknown id', () => {
  assert.equal(renameCategory('nonexistent', 'x'), undefined)
})

test('deleteCategory removes it and returns true; false if it never existed', () => {
  assert.equal(deleteCategory('sides'), true)
  assert.equal(getCategory('sides'), undefined)
  assert.equal(deleteCategory('sides'), false)
})

test('__resetCategoryStoreForTests puts the taxonomy back to the original 8', () => {
  createCategory('Extra')
  deleteCategory('coffee')
  __resetCategoryStoreForTests()
  assert.equal(getCategories().length, 8)
  assert.notEqual(getCategory('coffee'), undefined)
})
