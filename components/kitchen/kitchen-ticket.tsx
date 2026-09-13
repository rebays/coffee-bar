'use client'

import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { formatSBD } from '@/lib/money'
import type { StaffOrderView } from '@/lib/orders/staff-view'

const TAG: Record<'paid' | 'making' | 'ready', { label: string; variant: 'new' | 'live' }> = {
  paid: { label: 'New', variant: 'new' },
  making: { label: 'Making', variant: 'live' },
  ready: { label: 'Ready', variant: 'live' },
}

const ACTION_LABEL: Record<'paid' | 'making' | 'ready', string> = {
  paid: 'Start making',
  making: 'Mark ready',
  ready: 'Mark collected',
}

/**
 * A big-screen ticket, not the compact staff-dashboard row — kiosk density
 * is set by the parent, and action labels name the outcome ("Mark ready",
 * "Mark collected") since this is meant to be read across a kitchen, not
 * tapped from close up. Which action a ticket offers is entirely a function
 * of which column it's rendered in (KitchenDashboard passes a zero-arg
 * onAction already bound to that column's transition) — the ticket itself
 * only needs to know its current state to label itself correctly.
 */
export function KitchenTicket({
  order,
  pending,
  onAction,
}: {
  order: StaffOrderView & { state: 'paid' | 'making' | 'ready' }
  pending: boolean
  onAction: () => void
}) {
  const tag = TAG[order.state]

  return (
    <li className="border-hairline bg-ground rounded-tile animate-ticket-enter flex flex-col gap-3 border p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-item">{order.pickupCode}</p>
        <Tag variant={tag.variant}>{tag.label}</Tag>
      </div>

      <ul className="flex flex-col gap-1">
        {order.lines.map((line, index) => (
          <li key={index} className="text-body flex flex-col gap-0.5">
            <span>
              {line.quantity} × {line.name}
              {line.customizations.length > 0 ? (
                <span className="text-secondary"> ({line.customizations.join(', ')})</span>
              ) : null}
            </span>
            {line.notes ? (
              <p className="text-small text-primary font-semibold">Note: {line.notes}</p>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="border-hairline flex items-center justify-between border-t pt-2">
        <span className="text-body text-secondary">Total</span>
        <span className="text-price">{formatSBD(order.total)}</span>
      </div>

      <Button size="lg" block disabled={pending} onClick={onAction}>
        {ACTION_LABEL[order.state]}
      </Button>
    </li>
  )
}
