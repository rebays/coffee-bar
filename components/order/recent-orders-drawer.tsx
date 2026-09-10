'use client'

import { useEffect, useRef, useState } from 'react'

import { OrderHistoryCard } from '@/components/order/order-history-card'
import type { OrderHistoryView } from '@/lib/orders/history-view'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

/**
 * The past-orders modal, triggered from BottomNav's "Recent orders" button.
 * Extracted from the old standalone RecentOrdersLauncher so the fetch,
 * focus-trap and drawer chrome aren't rebuilt for the merged nav bar.
 * Same trap/backdrop/Escape mechanics as ItemSheetShell, kept separate
 * rather than shared — that shell closes via router.back(), which only
 * makes sense for a routed sheet; this drawer is plain client state.
 */
export function RecentOrdersDrawer({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [orders, setOrders] = useState<OrderHistoryView[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/orders/recent', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : { orders: [] }))
      .then((data: { orders: OrderHistoryView[] }) => {
        if (!cancelled) setOrders(data.orders)
      })
      .catch(() => {
        if (!cancelled) setOrders([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const triggeredBy = document.activeElement as HTMLElement | null
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    const initialFocusable = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    ;(initialFocusable ?? panelRef.current)?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.documentElement.style.overflow = previousOverflow
      triggeredBy?.focus?.()
    }
    // Mount/unmount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="animate-backdrop-fade absolute inset-0 bg-black/50"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recent-orders-heading"
        tabIndex={-1}
        className="animate-sheet-rise shadow-float bg-raised relative flex w-full flex-col"
        style={{
          maxInlineSize: 'var(--container-form)',
          maxBlockSize: '88vh',
          borderRadius: 'var(--radius-sheet) var(--radius-sheet) 0 0',
        }}
      >
        <div className="border-hairline flex items-center justify-between border-b p-4">
          <h2 id="recent-orders-heading" className="text-item">
            Recent orders
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="tap-expand text-secondary hover:bg-sunken inline-flex items-center justify-center rounded-full"
            style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {orders === null ? (
            <p className="text-body text-secondary">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="text-body text-secondary">No past orders yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {orders.map((order) => (
                <OrderHistoryCard key={order.id} order={order} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
