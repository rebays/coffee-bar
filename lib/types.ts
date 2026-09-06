import type { Money } from './money.ts'

export type Category = 'espresso' | 'filter' | 'cold' | 'other' | 'food'

export type RoastLevel = 'light' | 'medium' | 'dark'

/** Segment count for the roast bar. Roast is never encoded by colour alone. */
export const ROAST_SEGMENTS: Record<RoastLevel, number> = {
  light: 1,
  medium: 2,
  dark: 3,
}

export const CATEGORIES: ReadonlyArray<{ id: Category; label: string }> = [
  { id: 'espresso', label: 'Espresso' },
  { id: 'filter', label: 'Filter' },
  { id: 'cold', label: 'Cold' },
  { id: 'other', label: 'Not coffee' },
  { id: 'food', label: 'Food' },
]

export type OptionChoice = {
  id: string
  label: string // "Oat"
  priceDelta: Money // minor units, may be 0
  soldOut?: boolean
}

export type OptionGroup = {
  id: string
  label: string // "Milk"
  required: boolean
  choices: OptionChoice[]
  defaultChoiceId: string
}

export type MenuItem = {
  slug: string
  name: string
  description: string
  tastingNote?: string // origin items only — renders in the `note` role
  roast?: RoastLevel // origin items only
  spec: string // "2 shots · 180ml · whole milk"
  basePrice: Money // minor units
  category: Category
  tags: string[]
  /**
   * Groups offered on the item sheet, in render order. Not in the original
   * type sketch, but the sheet needs a link from item to its options and an
   * item-to-groups list keeps groups shared rather than copied per item.
   */
  optionGroupIds: string[]
  isNew?: boolean
  soldOut?: boolean
  imageUrl?: string
}

/** Live shop state for the hero and status strip. Stubbed in `shop-state.ts`. */
export type ShopState = {
  isOpen: boolean
  /** "4pm" — the hour the strip reads when open. */
  closesAt: string
  /** "6:30am" — the hour the strip reads when closed. */
  opensAt: string
  waitMinutes: number
  /** Slug of the item on filter today, resolved against the menu. */
  filterTodaySlug: string
}
