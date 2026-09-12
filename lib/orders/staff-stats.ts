import { addMoney } from '../money.ts'
import { shopDayKey } from './pickup-code.ts'
import { LIVE_STATES } from './staff-view.ts'
import { listOrders } from './store.ts'
import type { Money } from '../money.ts'
import type { OrderState } from './types.ts'

/**
 * States that count toward revenue: the customer's payment has been
 * confirmed at some point, whether or not the drink has shipped yet.
 * `placed`/`awaiting_payment` haven't paid, and `payment_failed`/`cancelled`
 * never will — see docs/PAYMENTS.md §2 for the state machine this mirrors.
 */
const PAID_STATES: readonly OrderState[] = ['paid', 'making', 'ready', 'collected']

export type StaffStats = {
  /** Orders created during the current shop-day, any state. */
  ordersToday: number
  /** Sum of `total` for today's orders that reached at least `paid`. */
  revenueToday: Money
  /** Orders currently in an active, unresolved state. */
  liveOrders: number
  collectedToday: number
  cancelledToday: number
}

/**
 * Computed fresh from the in-memory order store on every call — there's no
 * separate stats table to keep in sync, so this can never drift from
 * `listOrders`, just like `expireIfStale` inside it already guarantees for
 * individual reads.
 */
export function getStaffStats(now: Date = new Date()): StaffStats {
  const today = shopDayKey(now)
  const orders = listOrders({})
  const ordersToday = orders.filter((order) => shopDayKey(new Date(order.createdAt)) === today)

  const revenueToday = addMoney(
    0,
    ...ordersToday.filter((order) => PAID_STATES.includes(order.state)).map((order) => order.total),
  )

  return {
    ordersToday: ordersToday.length,
    revenueToday,
    liveOrders: orders.filter((order) => LIVE_STATES.includes(order.state as (typeof LIVE_STATES)[number]))
      .length,
    collectedToday: ordersToday.filter((order) => order.state === 'collected').length,
    cancelledToday: ordersToday.filter((order) => order.state === 'cancelled').length,
  }
}
