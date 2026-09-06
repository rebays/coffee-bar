import { MENU } from './fixtures.ts'
import type { MenuItemFields } from './menu-item-input.ts'
import { CATEGORIES } from './types.ts'
import type { MenuItem } from './types.ts'

/**
 * Live, mutable menu state layered over the static fixtures — this answers
 * docs/CLAUDE.md decision 4 ("who edits items and flips sold-out, and from
 * what surface?") in full: the staff surface, through this store, for both
 * sold-out toggling and catalog editing. `lib/fixtures.ts` stays the
 * original seed data; nothing here ever writes back to it.
 *
 * Order is tracked separately from the item data (`order`, a slug array)
 * rather than relying on Map iteration order — creating, deleting, and
 * moving items all need to reason about "where in its category block does
 * this slug sit," which a plain insertion-ordered Map can't answer or
 * rearrange on its own.
 *
 * Anchored on globalThis for the same reason as lib/orders/store.ts —
 * Next.js can load this module more than once across separately-bundled
 * layers within one server process, and a plain module-scope `let` would
 * silently fork into two disconnected copies. On the client bundle (this
 * module is also reachable from lib/resolve-cart-line.ts, which the cart
 * store imports) globalThis just means "this browser tab's own copy," which
 * is no different from reading the static fixtures directly — a customer's
 * device was never going to see live staff edits without a refetch anyway.
 */
type MenuStoreState = {
  items: Map<string, MenuItem>
  /** Display order — always keeps each category's items contiguous, in CATEGORIES order. */
  order: string[]
}

function freshState(): MenuStoreState {
  return {
    items: new Map(MENU.map((item) => [item.slug, { ...item }])),
    order: MENU.map((item) => item.slug),
  }
}

const globalMenu = globalThis as unknown as { __coffeeBarMenuStore?: MenuStoreState }
const state = (globalMenu.__coffeeBarMenuStore ??= freshState())

function categoryRank(category: MenuItem['category']): number {
  return CATEGORIES.findIndex((c) => c.id === category)
}

/**
 * Inserts `slug` after the last existing item whose category sorts at or
 * before it, and before the first item whose category sorts later —
 * lands it at the end of its own category's block, or starts a new block
 * in the right place if the category is currently empty.
 */
function insertIntoOrder(slug: string, category: MenuItem['category']): void {
  const rank = categoryRank(category)
  let insertAt = state.order.length
  for (let i = 0; i < state.order.length; i++) {
    const other = state.items.get(state.order[i])!
    if (categoryRank(other.category) > rank) {
      insertAt = i
      break
    }
  }
  state.order.splice(insertAt, 0, slug)
}

function removeFromOrder(slug: string): void {
  const index = state.order.indexOf(slug)
  if (index !== -1) state.order.splice(index, 1)
}

/** Category and fixture order preserved on load; edits keep categories contiguous. */
export function getMenuItems(): MenuItem[] {
  return state.order.map((slug) => state.items.get(slug)!)
}

export function getMenuItem(slug: string): MenuItem | undefined {
  return state.items.get(slug)
}

/** Returns the updated item, or undefined if the slug isn't on the menu. */
export function setSoldOut(slug: string, soldOut: boolean): MenuItem | undefined {
  const item = state.items.get(slug)
  if (!item) return undefined
  const updated: MenuItem = { ...item, soldOut }
  state.items.set(slug, updated)
  return updated
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'item'
}

function uniqueSlug(base: string): string {
  if (!state.items.has(base)) return base
  let suffix = 2
  while (state.items.has(`${base}-${suffix}`)) suffix++
  return `${base}-${suffix}`
}

/** Slug is generated from `fields.name`, deduped against every existing slug. */
export function createMenuItem(fields: MenuItemFields): MenuItem {
  const slug = uniqueSlug(slugify(fields.name))
  const item: MenuItem = { ...fields, slug, soldOut: false }
  state.items.set(slug, item)
  insertIntoOrder(slug, item.category)
  return item
}

/**
 * Replaces every editable field at once (the edit form always resubmits
 * everything it shows) except `slug` and `soldOut`, which this never
 * touches. If `category` changed, repositions the item to the end of its
 * new category's block.
 */
export function updateMenuItem(slug: string, fields: MenuItemFields): MenuItem | undefined {
  const item = state.items.get(slug)
  if (!item) return undefined

  const updated: MenuItem = { ...fields, slug: item.slug, soldOut: item.soldOut }
  state.items.set(slug, updated)

  if (updated.category !== item.category) {
    removeFromOrder(slug)
    insertIntoOrder(slug, updated.category)
  }

  return updated
}

/** Returns true if an item existed and was removed. */
export function deleteMenuItem(slug: string): boolean {
  const existed = state.items.delete(slug)
  if (existed) removeFromOrder(slug)
  return existed
}

export type ReorderDirection = 'up' | 'down'

/**
 * Swaps `slug` with its neighbour in the given direction, but only within
 * its own category's block — a no-op if it's already first/last in that
 * category. Returns the full, current menu order either way.
 */
export function reorderMenuItem(slug: string, direction: ReorderDirection): MenuItem[] {
  const index = state.order.indexOf(slug)
  if (index === -1) return getMenuItems()

  const neighborIndex = direction === 'up' ? index - 1 : index + 1
  const neighborSlug = state.order[neighborIndex]
  if (neighborSlug === undefined) return getMenuItems()

  const item = state.items.get(slug)!
  const neighbor = state.items.get(neighborSlug)!
  if (item.category !== neighbor.category) return getMenuItems()

  state.order[index] = neighborSlug
  state.order[neighborIndex] = slug
  return getMenuItems()
}

/** Test-only reset — mirrors __resetOrderStoreForTests. */
export function __resetMenuStoreForTests(): void {
  const fresh = freshState()
  state.items.clear()
  for (const [slug, item] of fresh.items) state.items.set(slug, item)
  state.order.splice(0, state.order.length, ...fresh.order)
}
