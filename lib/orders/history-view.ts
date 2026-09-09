import { DISPLAY_STEPS, displayStepIndex, staffStateTagVariant } from './status-view.ts'
import type { Order, OrderLine, OrderState } from './types.ts'

export { staffStateTagVariant as historyStateTagVariant }

/** What a reorder needs to hand back to `addToCart` — see OrderLine.choices. */
export type ReorderLine = {
  slug: string
  choices: Record<string, string>
  quantity: number
  notes?: string
}

/**
 * What /orders and its receipt page send to the client. Never `deviceToken`
 * — same instinct as toStatusView and toStaffOrderView.
 */
export type OrderHistoryView = {
  id: string
  pickupCode: string
  lines: OrderLine[]
  total: Order['total']
  state: OrderState
  createdAt: string
  cancelReason?: string
  reorderLines: ReorderLine[]
}

export function toHistoryView(order: Order): OrderHistoryView {
  return {
    id: order.id,
    pickupCode: order.pickupCode,
    lines: order.lines,
    total: order.total,
    state: order.state,
    createdAt: order.createdAt,
    cancelReason: order.cancelReason,
    reorderLines: order.lines.map((line) => ({
      slug: line.slug,
      choices: line.choices ?? {},
      quantity: line.quantity,
      ...(line.notes ? { notes: line.notes } : {}),
    })),
  }
}

/**
 * Customer-facing vocabulary, not the staff labels in staff-view.ts — reuses
 * the same four-step progression the order status page already shows, so
 * history reads consistently with the tracker a customer just watched.
 */
export function historyStateLabel(state: OrderState): string {
  if (state === 'cancelled') return 'Cancelled'
  if (state === 'payment_failed') return 'Payment failed'
  const index = displayStepIndex(state)
  return index === null ? 'Unknown' : DISPLAY_STEPS[index]
}
