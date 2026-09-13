'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { formatSBD, formatSBDSpoken } from '@/lib/money'
import { allowedTransitions } from '@/lib/orders/state-machine'
import { displayStepIndex } from '@/lib/orders/status-view'
import type { OrderStatusView } from '@/lib/orders/status-view'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'

import { OrderStatusStepper } from './order-status-stepper'

const POLL_INTERVAL_MS = 4000

/**
 * A order still `awaiting_payment` genuinely needs the "pay at the counter"
 * instruction — but once it's actually `paid` (whichever provider confirmed
 * it), that copy would be wrong, even though both map to the same step-0
 * "Sent" position in the coarse 4-step tracker below.
 */
function payInstructionFor(state: OrderStatusView['state']): string | null {
  if (state === 'placed' || state === 'awaiting_payment') {
    return 'Pay at the counter. Show this code.'
  }
  if (state === 'paid') {
    return 'Payment received — sending to the kitchen.'
  }
  return null
}

/**
 * Confirmation screen and ongoing status tracker are the same page —
 * docs/PAYMENTS.md §4 describes them as one continuous view, differing only
 * in which state is currently active. Polls its own status via the route
 * handler; stops once the order reaches a state with no further
 * transitions, per the state machine's own terminal set rather than a
 * hardcoded list here.
 */
export function OrderStatusPoller({ initial }: { initial: OrderStatusView }) {
  const [status, setStatus] = useState(initial)
  const [demoMode, setDemoMode] = useState(false)
  const isTerminal = allowedTransitions(status.state).length === 0

  useEffect(() => {
    fetch('/api/shop-state', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { demoMode?: boolean } | null) => setDemoMode(data?.demoMode ?? false))
      .catch(() => setDemoMode(false))
  }, [])

  useEffect(() => {
    if (isTerminal) return
    const interval = setInterval(async () => {
      const response = await fetch(`/api/orders/${status.id}`, { cache: 'no-store' })
      if (response.ok) setStatus(await response.json())
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [status.id, isTerminal])

  const stepIndex = displayStepIndex(status.state)

  return (
    <div className="px-gutter flex flex-col items-center gap-8 py-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-spec wdth-condensed text-secondary">Pickup code</p>
        <p className="text-metric" aria-label={`Pickup code ${status.pickupCode.split('').join(' ')}`}>
          {status.pickupCode}
        </p>
        <p className="text-price" aria-label={formatSBDSpoken(status.total)}>
          {formatSBD(status.total)}
        </p>
      </div>

      {status.state === 'payment_failed' ? (
        <p className="text-danger-text text-body max-w-xs">
          The payment window expired before this order was paid. Please place a new order, or ask
          staff for help with this pickup code.
        </p>
      ) : status.state === 'cancelled' ? (
        <p className="text-danger-text text-body max-w-xs">
          This order was cancelled{status.cancelReason ? ` — ${status.cancelReason}` : '.'}
        </p>
      ) : (
        <>
          {demoMode && status.state === 'ready' ? (
            <p className="text-item">🟢 Ready for Pickup at Counter!</p>
          ) : payInstructionFor(status.state) ? (
            <p className="text-body text-secondary max-w-xs">{payInstructionFor(status.state)}</p>
          ) : null}
          {stepIndex !== null ? (
            <div className="w-full max-w-xs">
              <OrderStatusStepper activeIndex={stepIndex} />
            </div>
          ) : null}
        </>
      )}

      <ul className="divide-hairline w-full max-w-xs divide-y text-left">
        {status.lines.map((line, index) => (
          <li key={index} className="flex items-start gap-3 py-2">
            <ItemThumbnail src={line.imageUrl} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-body">
                  {line.quantity} × {line.name}
                  {line.customizations.length > 0 ? (
                    <span className="text-secondary"> ({line.customizations.join(', ')})</span>
                  ) : null}
                </span>
                <span className="text-price shrink-0">{formatSBD(line.lineTotal)}</span>
              </div>
              {line.notes ? <p className="tasting-note">“{line.notes}”</p> : null}
            </div>
          </li>
        ))}
      </ul>

      <Link href="/orders" className="text-accent text-body font-semibold">
        View your orders
      </Link>
    </div>
  )
}
