import { MENU } from './fixtures.ts'
import type { MenuItem } from './types.ts'

/**
 * Live, mutable menu state layered over the static fixtures — this is the
 * "sold-out toggling" half of docs/CLAUDE.md decision 4 ("who edits items
 * and flips sold-out, and from what surface?"): the staff surface, through
 * this store. `lib/fixtures.ts` stays the authored content (name, price,
 * description, option groups); nothing here ever changes those fields.
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
function freshItems(): Map<string, MenuItem> {
  return new Map(MENU.map((item) => [item.slug, { ...item }]))
}

const globalMenu = globalThis as unknown as { __coffeeBarMenuStore?: Map<string, MenuItem> }
const items = (globalMenu.__coffeeBarMenuStore ??= freshItems())

/** Category and fixture order preserved — Map iteration order is insertion order. */
export function getMenuItems(): MenuItem[] {
  return Array.from(items.values())
}

export function getMenuItem(slug: string): MenuItem | undefined {
  return items.get(slug)
}

/** Returns the updated item, or undefined if the slug isn't on the menu. */
export function setSoldOut(slug: string, soldOut: boolean): MenuItem | undefined {
  const item = items.get(slug)
  if (!item) return undefined
  const updated: MenuItem = { ...item, soldOut }
  items.set(slug, updated)
  return updated
}

/** Test-only reset — mirrors __resetOrderStoreForTests. */
export function __resetMenuStoreForTests(): void {
  items.clear()
  for (const [slug, item] of freshItems()) items.set(slug, item)
}
