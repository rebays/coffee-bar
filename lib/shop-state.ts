import { evaluateStoreSchedule } from './shop-hours.ts'
import { getStoreOverride } from './shop-override-store.ts'
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
 * Live shop state, read by the status strip and — the part that actually
 * matters — lib/actions/place-order.ts's server-side rejection of an order
 * placed while closed. `isOpen` here is the schedule in lib/shop-hours.ts,
 * unless staff have set a manual override (lib/shop-override-store.ts) to
 * force it either way. `waitMinutes` stays stubbed per build plan step 5 —
 * a real queue signal is a separate feature from operating hours.
 */
export function getShopState(): ShopState {
  const schedule = evaluateStoreSchedule()
  const override = getStoreOverride()
  const isOpen =
    override === 'FORCE_OPEN' ? true : override === 'FORCE_CLOSED' ? false : schedule.isOpen

  return {
    isOpen,
    closesAt: schedule.closesAtLabel,
    opensAt: schedule.opensAtLabel,
    opensAgainToday: schedule.opensAgainToday,
    waitMinutes: 6,
  }
}
