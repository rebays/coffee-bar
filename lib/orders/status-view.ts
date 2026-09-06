import type { Order, OrderLine, OrderState } from './types.ts'

/**
 * What the customer-facing status page and its polling endpoint send over
 * the wire — never the full Order. In particular, never `deviceToken`: it's
 * an anonymous identity, not a secret, but there's no reason to echo it
 * back to a page's own client JS, let alone to anyone else who opens the
 * same order URL.
 */
export type OrderStatusView = {
  id: string
  pickupCode: string
  lines: OrderLine[]
  total: Order['total']
  state: OrderState
  cancelReason?: string
}

export function toStatusView(order: Order): OrderStatusView {
  return {
    id: order.id,
    pickupCode: order.pickupCode,
    lines: order.lines,
    total: order.total,
    state: order.state,
    cancelReason: order.cancelReason,
  }
}

export const DISPLAY_STEPS = ['Sent', 'Making', 'Ready', 'Collected'] as const
export type DisplayStep = (typeof DISPLAY_STEPS)[number]

/**
 * DESIGN-SYSTEM.md §7's four-state progression is coarser than OrderState —
 * placed/awaiting_payment/paid all read as "Sent" to the customer, since
 * none of that distinction matters to someone waiting on their drink.
 * payment_failed and cancelled aren't part of the tracker at all; they get
 * their own failure treatment instead of a fifth step.
 */
export function displayStepIndex(state: OrderState): number | null {
  switch (state) {
    case 'placed':
    case 'awaiting_payment':
    case 'paid':
      return 0
    case 'making':
      return 1
    case 'ready':
      return 2
    case 'collected':
      return 3
    case 'payment_failed':
    case 'cancelled':
      return null
  }
}

/** Labels for the staff dashboard — customers never see raw OrderState. */
export const STAFF_STATE_LABEL: Record<OrderState, string> = {
  placed: 'Placed',
  awaiting_payment: 'Awaiting payment',
  paid: 'Paid',
  payment_failed: 'Payment failed',
  making: 'Making',
  ready: 'Ready',
  collected: 'Collected',
  cancelled: 'Cancelled',
}

/** Which Tag variant reads a state as "happening now" vs. settled/inactive. */
export function staffStateTagVariant(state: OrderState): 'default' | 'live' | 'sold-out' {
  switch (state) {
    case 'making':
    case 'ready':
      return 'live'
    case 'collected':
    case 'cancelled':
    case 'payment_failed':
      return 'sold-out'
    default:
      return 'default'
  }
}
