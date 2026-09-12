'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { formatSBD } from '@/lib/money'
import { staffLogoutAction } from '@/lib/actions/staff-auth'
import type { MenuItem } from '@/lib/types'
import type { StaffAction, StaffOrderView } from '@/lib/orders/staff-view'
import type { StaffStats } from '@/lib/orders/staff-stats'

import { StaffDemoModeToggle } from './staff-demo-mode-toggle'
import { StaffInventoryList } from './staff-inventory-list'
import { StaffOrderCard } from './staff-order-card'
import { StaffStatCard } from './staff-stat-card'
import { StaffStoreStatus } from './staff-store-status'

const POLL_INTERVAL_MS = 4000

type View = 'overview' | 'orders' | 'inventory' | 'settings'

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'orders', label: 'Orders' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'settings', label: 'Settings' },
]

/**
 * Desktop back-office shell for the staff surface — a full-bleed
 * sidebar-plus-content layout, distinct from the tablet-first
 * `data-density="kiosk"` treatment docs/BUILD-PLAN.md step 10 describes for
 * the counter device. Same data, same actions, wider screen. The kitchen
 * display at /kitchen stays a separate route for the physical ticket
 * screen — this links out to it rather than embedding it.
 */
export function StaffDashboard({
  staffName,
  initialOrders,
  initialMenuItems,
  initialStats,
}: {
  staffName: string
  initialOrders: StaffOrderView[]
  initialMenuItems: MenuItem[]
  initialStats: StaffStats
}) {
  const [view, setView] = useState<View>('overview')
  const [orders, setOrders] = useState(initialOrders)
  const [stats, setStats] = useState<StaffStats>(initialStats)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)

  // Read by the polling interval so it always searches on the latest term
  // without needing to restart itself (and without calling setState from
  // the effect body) every time staff types.
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

  const fetchStats = useCallback(async () => {
    const response = await fetch('/api/staff/stats', { cache: 'no-store' })
    if (!response.ok) return
    setStats(await response.json())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(searchRef.current.trim())
      fetchStats()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchOrders, fetchStats])

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
    fetchStats()
  }

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row">
      <aside
        className="border-hairline flex shrink-0 flex-row items-center justify-between gap-2 border-b p-4 lg:sticky lg:top-0 lg:h-screen lg:w-(--spacing-sidebar) lg:flex-col lg:items-stretch lg:justify-between lg:border-r lg:border-b-0 lg:p-6"
      >
        <div className="flex flex-row items-center gap-3 lg:flex-col lg:items-stretch lg:gap-6" style={{ minInlineSize: 0 }}>
          <div>
            <p className="text-item hidden lg:block">Staff</p>
            <p className="text-small text-secondary min-w-0 truncate lg:mt-1">{staffName}</p>
          </div>
          <nav aria-label="Staff dashboard" className="flex flex-row gap-1 lg:flex-col">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={view === item.id ? 'page' : undefined}
                onClick={() => setView(item.id)}
                className={[
                  'rounded-tile text-body px-3 py-2 text-left font-medium transition-colors',
                  view === item.id ? 'bg-structure text-on-structure' : 'text-secondary hover:bg-sunken',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 flex-row items-center gap-3 lg:flex-col lg:items-stretch lg:gap-3">
          <a href="/kitchen" className="text-accent text-body shrink-0 font-semibold">
            Kitchen display
          </a>
          <form action={staffLogoutAction} className="shrink-0">
            <Button type="submit" variant="secondary" size="sm" block>
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className="px-gutter flex w-full flex-1 flex-col gap-6 py-6 lg:px-10 lg:py-8">
        <h1 className="text-title">{NAV_ITEMS.find((item) => item.id === view)?.label}</h1>

        {error ? <p className="text-danger-text text-small">{error}</p> : null}

        {view === 'overview' ? (
          <OverviewView
            stats={stats}
            orders={orders}
            pendingOrderId={pendingOrderId}
            onAction={handleAction}
          />
        ) : null}

        {view === 'orders' ? (
          <OrdersView
            orders={orders}
            search={search}
            onSearchChange={handleSearchChange}
            pendingOrderId={pendingOrderId}
            onAction={handleAction}
          />
        ) : null}

        {view === 'inventory' ? <StaffInventoryList initialItems={initialMenuItems} /> : null}

        {view === 'settings' ? (
          <div className="flex max-w-2xl flex-col gap-4">
            <StaffStoreStatus />
            <StaffDemoModeToggle />
          </div>
        ) : null}
      </main>
    </div>
  )
}

function OverviewView({
  stats,
  orders,
  pendingOrderId,
  onAction,
}: {
  stats: StaffStats
  orders: StaffOrderView[]
  pendingOrderId: string | null
  onAction: (orderId: string, action: StaffAction, reason?: string) => void
}) {
  const recent = orders.slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StaffStatCard label="Orders today" value={String(stats.ordersToday)} />
        <StaffStatCard label="Revenue today" value={formatSBD(stats.revenueToday)} />
        <StaffStatCard label="Live now" value={String(stats.liveOrders)} />
        <StaffStatCard label="Collected today" value={String(stats.collectedToday)} />
        <StaffStatCard label="Cancelled today" value={String(stats.cancelledToday)} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-section">Live orders</h2>
        {recent.length === 0 ? (
          <p className="text-body text-secondary py-8 text-center">No live orders right now.</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {recent.map((order) => (
              <StaffOrderCard
                key={order.id}
                order={order}
                pending={pendingOrderId === order.id}
                onAction={(action, reason) => onAction(order.id, action, reason)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function OrdersView({
  orders,
  search,
  onSearchChange,
  pendingOrderId,
  onAction,
}: {
  orders: StaffOrderView[]
  search: string
  onSearchChange: (value: string) => void
  pendingOrderId: string | null
  onAction: (orderId: string, action: StaffAction, reason?: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by pickup code"
        aria-label="Search by pickup code"
        className="border-hairline rounded-tile text-body max-w-sm border p-3"
      />

      {orders.length === 0 ? (
        <p className="text-body text-secondary py-8 text-center">
          {search.trim() ? 'No order found for that pickup code today.' : 'No live orders right now.'}
        </p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <StaffOrderCard
              key={order.id}
              order={order}
              pending={pendingOrderId === order.id}
              onAction={(action, reason) => onAction(order.id, action, reason)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
