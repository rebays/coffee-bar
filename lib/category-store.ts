/**
 * Live, mutable category taxonomy — until now `lib/types.ts`'s `CATEGORIES`
 * was a fixed compile-time list; this answers the same "who edits it, from
 * what surface" question docs/CLAUDE.md decision 4 answered for menu items:
 * the staff surface, through this store. `Category` itself is now a plain
 * string id rather than a literal union, since a runtime-added category
 * can't extend a compile-time type.
 *
 * `globalThis`-anchored for the same cross-layer-module reason as every
 * other runtime store here (lib/orders/store.ts, lib/menu-store.ts, …).
 */
export type CategoryRecord = { id: string; label: string }

/** The menu's original taxonomy — order here is the menu's own order, unchanged from before this store existed. */
const DEFAULT_CATEGORIES: CategoryRecord[] = [
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'tea-refreshers', label: 'Tea & Refreshers' },
  { id: 'mains', label: 'Mains' },
  { id: 'sandwich', label: 'Sandwich' },
  { id: 'salad', label: 'Salad' },
  { id: 'sides', label: 'Sides' },
  { id: 'bakery-desserts', label: 'Bakery & Desserts' },
]

type CategoryStoreState = { categories: CategoryRecord[] }

function freshState(): CategoryStoreState {
  return { categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })) }
}

const globalCategories = globalThis as unknown as { __coffeeBarCategoryStore?: CategoryStoreState }
const state = (globalCategories.__coffeeBarCategoryStore ??= freshState())

/** Taxonomy order preserved on load; new categories append to the end. */
export function getCategories(): CategoryRecord[] {
  return state.categories
}

export function getCategory(id: string): CategoryRecord | undefined {
  return state.categories.find((category) => category.id === id)
}

function slugify(label: string): string {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'category'
}

function uniqueId(base: string): string {
  if (!state.categories.some((category) => category.id === base)) return base
  let suffix = 2
  while (state.categories.some((category) => category.id === `${base}-${suffix}`)) suffix++
  return `${base}-${suffix}`
}

/** Id is generated from `label`, deduped against every existing id. */
export function createCategory(label: string): CategoryRecord {
  const id = uniqueId(slugify(label))
  const category: CategoryRecord = { id, label }
  state.categories.push(category)
  return category
}

export function renameCategory(id: string, label: string): CategoryRecord | undefined {
  const category = getCategory(id)
  if (!category) return undefined
  category.label = label
  return category
}

/** Returns true if a category existed and was removed. Callers are responsible for checking it's not in use first. */
export function deleteCategory(id: string): boolean {
  const index = state.categories.findIndex((category) => category.id === id)
  if (index === -1) return false
  state.categories.splice(index, 1)
  return true
}

/** Test-only reset — mirrors __resetMenuStoreForTests. */
export function __resetCategoryStoreForTests(): void {
  const fresh = freshState()
  state.categories.splice(0, state.categories.length, ...fresh.categories)
}
