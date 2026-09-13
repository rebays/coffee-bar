'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { Tag } from '@/components/ui/tag'
import { formatSBD, formatSBDSpoken } from '@/lib/money'
import { STAFF_STATE_LABEL, staffStateTagVariant } from '@/lib/orders/status-view'
import { staffActionsForState } from '@/lib/orders/staff-view'
import type { StaffAction, StaffOrderView } from '@/lib/orders/staff-view'
import { START_MAKING_BEFORE_PAYMENT } from '@/lib/shop-state'

export function StaffOrderCard({
  order,
  pending,
  onAction,
}: {
  order: StaffOrderView
  pending: boolean
  onAction: (action: StaffAction, reason?: string) => void
}) {
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState('')
  const actions = staffActionsForState(order.state, START_MAKING_BEFORE_PAYMENT)

  function handleAction(action: StaffAction) {
    if (action === 'cancel') {
      setCancelling(true)
      return
    }
    onAction(action)
  }

  function confirmCancel() {
    onAction('cancel', reason.trim() || undefined)
    setCancelling(false)
    setReason('')
  }

  return (
    <li className="border-hairline bg-raised rounded-tile flex flex-col gap-3 border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-title">{order.pickupCode}</p>
          {/* suppressHydrationWarning: this is a 'use client' component, so
              Next server-renders it too — if the server process's timezone
              differs from the staff device's browser, toLocaleTimeString
              legitimately disagrees between the two passes. That's expected
              here (this is a local wall-clock time, not orderable data), so
              it's suppressed rather than a source of a real mismatch. */}
          <p className="text-small text-tertiary mt-1" suppressHydrationWarning>
            {new Date(order.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
        <Tag variant={staffStateTagVariant(order.state)}>{STAFF_STATE_LABEL[order.state]}</Tag>
      </div>

      <ul className="flex flex-col gap-1">
        {order.lines.map((line, index) => (
          <li key={index} className="flex items-start gap-3">
            <ItemThumbnail src={line.imageUrl} size={40} />
            <div className="text-body min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-4">
                <span>
                  {line.quantity} × {line.name}
                  {line.customizations.length > 0 ? (
                    <span className="text-secondary"> ({line.customizations.join(', ')})</span>
                  ) : null}
                </span>
                <span className="text-price shrink-0">{formatSBD(line.lineTotal)}</span>
              </div>
              {/* Bold, not quiet secondary text — this is an instruction a
                  barista must not miss, not decorative detail. Not signal-red
                  either: that's reserved for destructive actions and errors
                  (docs/DESIGN-SYSTEM.md §2), and a note isn't either. */}
              {line.notes ? (
                <p className="text-small text-primary font-semibold">Note: {line.notes}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="border-hairline flex items-center justify-between border-t pt-2">
        <span className="text-body text-secondary">Total</span>
        <span className="text-price" aria-label={formatSBDSpoken(order.total)}>
          {formatSBD(order.total)}
        </span>
      </div>

      {order.cancelReason ? (
        <p className="text-danger-text text-small">Cancelled — {order.cancelReason}</p>
      ) : null}

      {cancelling ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={`cancel-reason-${order.id}`} className="text-small text-secondary">
            Reason for cancelling
          </label>
          <input
            id={`cancel-reason-${order.id}`}
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Customer changed their mind"
            className="border-hairline rounded-input text-body border p-2"
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="md" onClick={() => setCancelling(false)} disabled={pending}>
              Keep order
            </Button>
            <Button variant="destructive" size="md" onClick={confirmCancel} disabled={pending}>
              Confirm cancel
            </Button>
          </div>
        </div>
      ) : actions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((spec) => (
            <Button
              key={spec.action}
              variant={spec.variant}
              size="md"
              disabled={pending}
              onClick={() => handleAction(spec.action)}
            >
              {spec.label}
            </Button>
          ))}
        </div>
      ) : null}
    </li>
  )
}
