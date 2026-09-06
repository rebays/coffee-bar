import type { ShopState } from './types.ts'

/**
 * There is exactly one shop and no multi-location data model yet — CLAUDE.md
 * lists that as a still-open question. This constant is the one place that
 * changes when it's answered.
 */
export const SHOP_ID = 'honiara'

/**
 * CLAUDE.md's other open question: does the barista start making before
 * payment clears? Unresolved, so this stays false — the conservative
 * default docs/PAYMENTS.md §2 recommends for counter payment.
 */
export const START_MAKING_BEFORE_PAYMENT = false

/**
 * Stubbed live shop state per build plan step 5. The hero and status strip
 * read only this shape, so swapping in a real clock/queue signal later is a
 * one-function change with no callers to touch.
 */
export function getShopState(): ShopState {
  return {
    isOpen: true,
    closesAt: '4pm',
    opensAt: '6:30am',
    waitMinutes: 6,
    filterTodaySlug: 'filter-kenya-kiambu',
  }
}
