'use client'

import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { formatSBD } from '@/lib/money'
import type { StaffOrderView } from '@/lib/orders/staff-view'

/**
 * A big-screen ticket, not the compact staff-dashboard row — kiosk density
 * is set by the parent, and the one action button reads a fuller label
 * ("Mark as Ready for Collection") than the dashboard's terser "Ready",
 * since this is meant to be read across a kitchen, not tapped from close up.
 */
export function KitchenTicket({
  order,
  pending,
  onAction,
}: {
  order: StaffOrderView
  pending: boolean
  onAction: (action: 'start_making' | 'ready') => void
}) {
  const isPaid = order.state === 'paid'

  return (
    <li className="border-hairline rounded-tile flex flex-col gap-3 border p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-title">{order.pickupCode}</p>
        <Tag variant={isPaid ? 'new' : 'live'}>{isPaid ? 'New' : 'Making'}</Tag>
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

      <Button
        size="lg"
        block
        disabled={pending}
        onClick={() => onAction(isPaid ? 'start_making' : 'ready')}
      >
        {isPaid ? 'Start making' : 'Mark as Ready for Collection'}
      </Button>
    </li>
  )
}
