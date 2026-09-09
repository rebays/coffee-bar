import type { Money } from './money.ts'

export type Category =
  | 'best-sellers'
  | 'coffee'
  | 'tea-refreshers'
  | 'mains'
  | 'sandwich'
  | 'salad'
  | 'sides'
  | 'bakery-desserts'

export type RoastLevel = 'light' | 'medium' | 'dark'

/** Segment count for the roast bar. Roast is never encoded by colour alone. */
export const ROAST_SEGMENTS: Record<RoastLevel, number> = {
  light: 1,
  medium: 2,
  dark: 3,
}

/** The shop's category taxonomy — order here is the menu's own order. */
export const CATEGORIES: ReadonlyArray<{ id: Category; label: string }> = [
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'tea-refreshers', label: 'Tea & Refreshers' },
  { id: 'mains', label: 'Mains' },
  { id: 'sandwich', label: 'Sandwich' },
  { id: 'salad', label: 'Salad' },
  { id: 'sides', label: 'Sides' },
  { id: 'bakery-desserts', label: 'Bakery & Desserts' },
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
  /**
   * Show this group's choice in the cart/order summary even when it's the
   * default — e.g. sweetness, where "100% Sugar" is order-relevant
   * information a barista needs stated every time, unlike milk defaulting
   * silently to "whole." Omitted (falsy) keeps the usual behaviour: only a
   * non-default choice surfaces as a customization.
   */
  alwaysShow?: boolean
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

/** Live shop state for the status strip. Computed in `shop-state.ts`. */
export type ShopState = {
  isOpen: boolean
  /** "4:30 PM" — meaningful while open. */
  closesAt: string
  /** "7:00 AM" — meaningful while closed. */
  opensAt: string
  /** While closed: does the shop open again later today, or tomorrow? */
  opensAgainToday: boolean
  waitMinutes: number
}
