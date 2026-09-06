import { test } from 'node:test'
import assert from 'node:assert/strict'

import { MENU, OPTION_GROUPS, getMenuItem, getOptionGroups } from './fixtures.ts'
import { CATEGORIES } from './types.ts'
import { isMoney } from './money.ts'

test('every category carries at least two items', () => {
  for (const { id, label } of CATEGORIES) {
    const items = MENU.filter((item) => item.category === id)
    assert.ok(items.length >= 2, `${label} has ${items.length} item(s)`)
  }
})

test('slugs are unique and URL-safe, since each one is a route', () => {
  const slugs = MENU.map((item) => item.slug)
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug')
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${slug} is not a clean slug`)
  }
})

test('every price is integer minor units', () => {
  for (const item of MENU) {
    assert.ok(isMoney(item.basePrice), `${item.slug} price ${item.basePrice} is not an integer`)
    assert.ok(item.basePrice > 0, `${item.slug} is free`)
  }
  for (const group of Object.values(OPTION_GROUPS)) {
    for (const choice of group.choices) {
      assert.ok(
        isMoney(choice.priceDelta),
        `${group.id}/${choice.id} delta ${choice.priceDelta} is not an integer`,
      )
    }
  }
})

test('the menu includes a sold-out item, kept visible rather than removed', () => {
  const soldOut = MENU.filter((item) => item.soldOut)
  assert.ok(soldOut.length >= 1, 'no sold-out item to render the struck-through state')
})

test('origin items carry both a roast level and a tasting note', () => {
  const origin = MENU.filter((item) => item.roast !== undefined)
  assert.ok(origin.length >= 1, 'no origin item to render the roast bar')
  for (const item of origin) {
    assert.ok(item.tastingNote, `${item.slug} has a roast but no tasting note`)
  }
  // And the reverse — a note without a roast would render a bar with no segments.
  for (const item of MENU) {
    if (item.tastingNote) assert.ok(item.roast, `${item.slug} has a note but no roast`)
  }
})

test('copy holds to the house style', () => {
  for (const item of MENU) {
    assert.ok(item.description.length > 0, `${item.slug} has no description`)
    assert.ok(
      item.description.length <= 68,
      `${item.slug} description runs past the 68-character cap`,
    )
    // Sentence case: never an all-caps word, tags included.
    for (const tag of item.tags) {
      assert.notEqual(tag, tag.toUpperCase(), `${item.slug} tag "${tag}" is all caps`)
    }
  }
  for (const item of MENU) {
    if (!item.tastingNote) continue
    const terms = item.tastingNote.split(',')
    assert.ok(
      terms.length >= 3 && terms.length <= 4,
      `${item.slug} note has ${terms.length} terms, expected three or four`,
    )
  }
})

test('every option group resolves and its default is one of its choices', () => {
  for (const item of MENU) {
    const groups = getOptionGroups(item)
    assert.equal(groups.length, item.optionGroupIds.length)
    for (const group of groups) {
      const ids = group.choices.map((choice) => choice.id)
      assert.equal(new Set(ids).size, ids.length, `${group.id} has a duplicate choice id`)
      assert.ok(
        ids.includes(group.defaultChoiceId),
        `${group.id} default "${group.defaultChoiceId}" is not one of its choices`,
      )
    }
  }
})

test('getOptionGroups throws rather than silently dropping an unknown group', () => {
  assert.throws(
    () => getOptionGroups({ ...MENU[0], optionGroupIds: ['no-such-group'] }),
    /Unknown option group/,
  )
})

test('getMenuItem finds by slug and returns undefined otherwise', () => {
  assert.equal(getMenuItem('flat-white')?.name, 'Flat white')
  assert.equal(getMenuItem('espresso-martini'), undefined)
})
