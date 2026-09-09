'use client'

import { useEffect, useRef, useState } from 'react'

import type { OrderStatusView } from '@/lib/orders/status-view'

const POLL_INTERVAL_MS = 400
/** Theatrical minimum — never resolves faster than this even if the server confirms sooner. */
const MIN_DISPLAY_MS = 3000

/**
 * Full-screen "processing" overlay for the simulated M-SELEN flow. This is
 * purely a display of what the server has actually done — it polls the same
 * real /api/orders/[id] endpoint the order status page uses, and only calls
 * `onConfirmed` once that order's own state has genuinely left
 * `awaiting_payment`. Nothing here ever claims the order is paid on its own
 * authority; the real transition happens in lib/payments/reconciler.ts,
 * server-side, on its own schedule (see lib/payments/demo-mselen.ts).
 */
export function MSelenProcessingOverlay({
  orderId,
  phoneNumber,
  onConfirmed,
}: {
  orderId: string
  /** What the customer actually typed — displayed here, not trusted for anything functional. */
  phoneNumber: string
  onConfirmed: () => void
}) {
  const [confirmed, setConfirmed] = useState(false)
  const mountedAt = useRef(0)

  useEffect(() => {
    let cancelled = false
    mountedAt.current = Date.now()

    const interval = setInterval(async () => {
      const response = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' })
      if (!response.ok || cancelled) return
      const status: OrderStatusView = await response.json()

      const serverConfirmed = status.state !== 'placed' && status.state !== 'awaiting_payment'
      const minimumElapsed = Date.now() - mountedAt.current >= MIN_DISPLAY_MS
      if (serverConfirmed && minimumElapsed) {
        cancelled = true
        clearInterval(interval)
        setConfirmed(true)
      }
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [orderId])

  useEffect(() => {
    if (!confirmed) return
    const timeout = setTimeout(onConfirmed, 600)
    return () => clearTimeout(timeout)
  }, [confirmed, onConfirmed])

  return (
    <div className="bg-ground fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 text-center">
      <ProgressRing done={confirmed} />
      <div className="px-gutter flex flex-col gap-2">
        <p className="text-item">
          {confirmed ? 'Payment received' : `Sending M-SELEN prompt to ${phoneNumber}…`}
        </p>
        <p className="text-body text-secondary max-w-xs">
          {confirmed
            ? 'Your order is on its way to the kitchen.'
            : 'Approve the payment prompt on your phone to continue.'}
        </p>
      </div>
    </div>
  )
}

function ProgressRing({ done }: { done: boolean }) {
  return (
    <div className="relative" style={{ inlineSize: '4rem', blockSize: '4rem' }}>
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={done ? '' : 'animate-spin'}
        style={{ animationDuration: '900ms' }}
      >
        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-hairline)" strokeWidth="5" />
        {done ? (
          <path
            d="M20 33l8 8 16-16"
            fill="none"
            stroke="var(--color-success)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="163.4"
            strokeDashoffset="120"
          />
        )}
      </svg>
    </div>
  )
}
