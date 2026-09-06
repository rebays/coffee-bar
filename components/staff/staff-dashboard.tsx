'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { staffLogoutAction } from '@/lib/actions/staff-auth'
import type { MenuItem } from '@/lib/types'
import type { StaffAction, StaffOrderView } from '@/lib/orders/staff-view'

import { StaffInventoryList } from './staff-inventory-list'
import { StaffOrderCard } from './staff-order-card'

const POLL_INTERVAL_MS = 4000

type View = 'orders' | 'inventory'

/**
 * Tablet-first per docs/BUILD-PLAN.md step 10 — `data-density="kiosk"` here
 * lifts every control token to the larger targets for the whole surface,
 * the same mechanism the customer-facing tokens already support.
 */
export function StaffDashboard({
  staffName,
  initialOrders,
  initialMenuItems,
}: {
  staffName: string
  initialOrders: StaffOrderView[]
  initialMenuItems: MenuItem[]
}) {
  const [view, setView] = useState<View>('orders')
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)

  // Read by the polling interval so it always searches on the latest term
  // without needing to restart itself (and without calling setState from
  // the effect body) every time the customer types.
  const searchRef = useRef(search)
  useEffect(() => {
    searchRef.current = search
  }, [search])

  const fetchOrders = useCallback(async (code: string) => {
    const url = code ? `/api/staff/orders?code=${encodeURIComponent(code)}` : '/api/staff/orders'
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return
    const data: { orders: StaffOrderView[] } = await response.json()
    setOrders(data.orders)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => fetchOrders(searchRef.current.trim()), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchOrders])

  function handleSearchChange(value: string) {
    setSearch(value)
    fetchOrders(value.trim())
  }

  async function handleAction(orderId: string, action: StaffAction, reason?: string) {
    setPendingOrderId(orderId)
    setError(null)

    const response = await fetch(`/api/staff/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    })
    if (!response.ok) setError('That action failed — try again.')

    setPendingOrderId(null)
    fetchOrders(search.trim())
  }

  return (
    <main
      data-density="kiosk"
      className="px-gutter mx-auto flex w-full flex-1 flex-col gap-4 py-6"
      style={{ maxInlineSize: 'var(--container-menu)' }}
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-title">{view === 'orders' ? 'Orders' : 'Inventory'}</h1>
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-body text-secondary min-w-0 truncate">{staffName}</span>
          <form action={staffLogoutAction} className="shrink-0">
            <Button type="submit" variant="secondary" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      <div role="radiogroup" aria-label="View" className="flex gap-2">
        <Chip
          label="Orders"
          selectionRole="radio"
          selected={view === 'orders'}
          onClick={() => setView('orders')}
        />
        <Chip
          label="Inventory"
          selectionRole="radio"
          selected={view === 'inventory'}
          onClick={() => setView('inventory')}
        />
      </div>

      {view === 'orders' ? (
        <>
          <input
            type="text"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by pickup code"
            aria-label="Search by pickup code"
            className="border-hairline rounded-tile text-body border p-3"
          />

          {error ? <p className="text-danger-text text-small">{error}</p> : null}

          {orders.length === 0 ? (
            <p className="text-body text-secondary py-8 text-center">
              {search.trim() ? 'No order found for that pickup code today.' : 'No live orders right now.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {orders.map((order) => (
                <StaffOrderCard
                  key={order.id}
                  order={order}
                  pending={pendingOrderId === order.id}
                  onAction={(action, reason) => handleAction(order.id, action, reason)}
                />
              ))}
            </ul>
          )}
        </>
      ) : (
        <StaffInventoryList initialItems={initialMenuItems} />
      )}
    </main>
  )
}
