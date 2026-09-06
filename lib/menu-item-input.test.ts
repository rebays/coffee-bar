import { test } from 'node:test'
import assert from 'node:assert/strict'

import { parseMenuItemFields } from './menu-item-input.ts'

function validInput(overrides: Record<string, unknown> = {}) {
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

test('a fully valid input parses into the expected fields', () => {
  const result = parseMenuItemFields(validInput())
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.fields.name, 'Espresso tonic')
  assert.equal(result.fields.category, 'cold')
  assert.equal(result.fields.basePrice, 4200)
  assert.deepEqual(result.fields.tags, ['Dairy free'])
  assert.deepEqual(result.fields.optionGroupIds, ['size'])
  assert.equal(result.fields.isNew, false)
  assert.equal(result.fields.tastingNote, undefined)
  assert.equal(result.fields.roast, undefined)
  assert.equal(result.fields.imageUrl, undefined)
})

test('name, description, and spec are required and trimmed', () => {
  assert.equal(parseMenuItemFields(validInput({ name: '' })).ok, false)
  assert.equal(parseMenuItemFields(validInput({ name: '   ' })).ok, false)
  assert.equal(parseMenuItemFields(validInput({ description: '' })).ok, false)
  assert.equal(parseMenuItemFields(validInput({ spec: '' })).ok, false)

  const result = parseMenuItemFields(validInput({ name: '  Padded  ' }))
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.fields.name, 'Padded')
})

test('category must be one of the known values', () => {
  assert.equal(parseMenuItemFields(validInput({ category: 'dessert' })).ok, false)
  assert.equal(parseMenuItemFields(validInput({ category: '' })).ok, false)
})

test('basePrice must be a non-negative integer', () => {
  assert.equal(parseMenuItemFields(validInput({ basePrice: 42.5 })).ok, false)
  assert.equal(parseMenuItemFields(validInput({ basePrice: -100 })).ok, false)
  assert.equal(parseMenuItemFields(validInput({ basePrice: '4200' })).ok, false)

  const free = parseMenuItemFields(validInput({ basePrice: 0 }))
  assert.equal(free.ok, true, 'zero is a valid, if unusual, price')
})

test('tags and optionGroupIds must be string arrays; blank tags are dropped', () => {
  assert.equal(parseMenuItemFields(validInput({ tags: 'Dairy free' })).ok, false)
  assert.equal(parseMenuItemFields(validInput({ tags: [1, 2] })).ok, false)
  assert.equal(parseMenuItemFields(validInput({ optionGroupIds: 'size' })).ok, false)

  const result = parseMenuItemFields(validInput({ tags: ['Local', '  ', ''] }))
  assert.equal(result.ok, true)
  if (result.ok) assert.deepEqual(result.fields.tags, ['Local'])
})

test('an unknown option group id is rejected rather than silently dropped', () => {
  const result = parseMenuItemFields(validInput({ optionGroupIds: ['size', 'no-such-group'] }))
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.error, /no-such-group/)
})

test('roast accepts light, medium, dark, or omission, and rejects anything else', () => {
  for (const roast of ['light', 'medium', 'dark']) {
    const result = parseMenuItemFields(validInput({ roast }))
    assert.equal(result.ok, true)
    if (result.ok) assert.equal(result.fields.roast, roast)
  }
  assert.equal(parseMenuItemFields(validInput({ roast: 'burnt' })).ok, false)

  const omitted = parseMenuItemFields(validInput({ roast: '' }))
  assert.equal(omitted.ok, true)
  if (omitted.ok) assert.equal(omitted.fields.roast, undefined)
})

test('tastingNote and imageUrl are optional and blank out to undefined', () => {
  const withValues = parseMenuItemFields(
    validInput({ tastingNote: 'Cherry, cola, long finish', imageUrl: 'https://example.com/a.jpg' }),
  )
  assert.equal(withValues.ok, true)
  if (withValues.ok) {
    assert.equal(withValues.fields.tastingNote, 'Cherry, cola, long finish')
    assert.equal(withValues.fields.imageUrl, 'https://example.com/a.jpg')
  }

  const blank = parseMenuItemFields(validInput({ tastingNote: '', imageUrl: '' }))
  assert.equal(blank.ok, true)
  if (blank.ok) {
    assert.equal(blank.fields.tastingNote, undefined)
    assert.equal(blank.fields.imageUrl, undefined)
  }
})

test('isNew defaults to false and only true is truthy', () => {
  const result = parseMenuItemFields(validInput())
  assert.equal(result.ok, true)
  if (result.ok) assert.equal(result.fields.isNew, false)

  const marked = parseMenuItemFields(validInput({ isNew: true }))
  assert.equal(marked.ok, true)
  if (marked.ok) assert.equal(marked.fields.isNew, true)

  const truthyButNotTrue = parseMenuItemFields(validInput({ isNew: 'yes' }))
  assert.equal(truthyButNotTrue.ok, true)
  if (truthyButNotTrue.ok) assert.equal(truthyButNotTrue.fields.isNew, false)
})

test('soldOut is never accepted from this input — it stays the separate toggle', () => {
  const result = parseMenuItemFields(validInput({ soldOut: true }))
  assert.equal(result.ok, true)
  if (result.ok) assert.equal('soldOut' in result.fields, false)
})
