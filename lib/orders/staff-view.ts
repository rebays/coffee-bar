import type { Order, OrderLine, OrderState } from './types.ts'

/**
 * What the staff dashboard and its endpoints send over the wire. Same
 * instinct as toStatusView in status-view.ts — never echo `deviceToken`,
 * an anonymous customer identity, back out over an unrelated channel just
 * because it happens to be a field on Order.
 */
export type StaffOrderView = {
  id: string
  pickupCode: string
  lines: OrderLine[]
  total: Order['total']
  state: OrderState
  createdAt: string
  updatedAt: string
  cancelReason?: string
}

export function toStaffOrderView(order: Order): StaffOrderView {
  return {
    id: order.id,
    pickupCode: order.pickupCode,
    lines: order.lines,
    total: order.total,
    state: order.state,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    cancelReason: order.cancelReason,
  }
}

/**
 * `paid` and `ready` aren't named in docs/BUILD-PLAN.md step 10's live-list
 * bullet, but the state machine requires an explicit paid -> making step
 * and a ready -> collected step, so both need to stay visible and
 * actionable, not just `awaiting_payment` and `making`.
 */
export const LIVE_STATES = ['awaiting_payment', 'paid', 'making', 'ready'] as const

export type StaffAction = 'mark_paid' | 'start_making' | 'ready' | 'collected' | 'cancel'

/**
 * Single source of truth for what each staff button does to the state
 * machine — the PATCH route validates incoming actions against this map's
 * keys, and staffActionsForState below decides which buttons a given order
 * shows, so the two can never drift into offering a button the route would
 * reject.
 */
export const STAFF_ACTION_TARGET_STATE: Record<StaffAction, OrderState> = {
  mark_paid: 'paid',
  start_making: 'making',
  ready: 'ready',
  collected: 'collected',
  cancel: 'cancelled',
}

export type StaffActionSpec = {
  action: StaffAction
  label: string
  variant: 'primary' | 'secondary' | 'destructive'
}

/**
 * Which buttons the dashboard shows for a given order, in display order.
 * `start_making` only appears from `awaiting_payment` when
 * startMakingBeforePayment is on — the state machine forbids that edge
 * otherwise (docs/CLAUDE.md open question 5).
 */
export function staffActionsForState(
  state: OrderState,
  startMakingBeforePayment: boolean,
): StaffActionSpec[] {
  switch (state) {
    case 'awaiting_payment':
      return [
        { action: 'mark_paid', label: 'Mark paid', variant: 'primary' },
        ...(startMakingBeforePayment
          ? [{ action: 'start_making' as const, label: 'Start making', variant: 'secondary' as const }]
          : []),
        { action: 'cancel', label: 'Cancel', variant: 'destructive' },
      ]
    case 'paid':
      return [
        { action: 'start_making', label: 'Start making', variant: 'primary' },
        { action: 'cancel', label: 'Cancel', variant: 'destructive' },
      ]
    case 'making':
      return [
        { action: 'ready', label: 'Ready', variant: 'primary' },
        { action: 'cancel', label: 'Cancel', variant: 'destructive' },
      ]
    case 'ready':
      return [{ action: 'collected', label: 'Collected', variant: 'primary' }]
    default:
      return []
  }
}
