import type { OrderState } from './types.ts'

/**
 * docs/PAYMENTS.md §2's diagram draws the happy path plus the one recovery
 * edge (payment_failed -> cancelled); the staff surface's general "Cancel
 * with a reason" (§4) is the reason every pre-fulfillment state also allows
 * a direct edge to cancelled — cancelling something already ready or
 * collected isn't a real operation, so those two stay terminal aside from
 * that.
 */
const BASE_TRANSITIONS: Record<OrderState, readonly OrderState[]> = {
  placed: ['awaiting_payment', 'cancelled'],
  awaiting_payment: ['paid', 'payment_failed', 'cancelled'],
  paid: ['making', 'cancelled'],
  payment_failed: ['cancelled'],
  making: ['ready', 'cancelled'],
  ready: ['collected'],
  collected: [],
  cancelled: [],
}

export type TransitionOptions = {
  /**
   * CLAUDE.md's open question 5 / PAYMENTS.md §2: does the kitchen start
   * before payment clears? Unresolved, so this defaults to false — the
   * conservative reading for counter payment, where the customer is
   * walking to the till anyway. This only ever widens what's allowed; it
   * never removes the normal paid -> making edge.
   */
  startMakingBeforePayment?: boolean
}

export function allowedTransitions(
  from: OrderState,
  options: TransitionOptions = {},
): readonly OrderState[] {
  const base = BASE_TRANSITIONS[from]
  if (from === 'awaiting_payment' && options.startMakingBeforePayment) {
    return [...base, 'making']
  }
  return base
}

export function canTransition(
  from: OrderState,
  to: OrderState,
  options: TransitionOptions = {},
): boolean {
  return allowedTransitions(from, options).includes(to)
}
