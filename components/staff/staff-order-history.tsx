'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Tag } from '@/components/ui/tag'
import { formatSBD } from '@/lib/money'
import { STAFF_STATE_LABEL, staffStateTagVariant } from '@/lib/orders/status-view'
import { HISTORY_PERIODS } from '@/lib/orders/period'
import type { HistoryPeriod } from '@/lib/orders/period'
import { HISTORY_PAGE_SIZE } from '@/lib/orders/staff-view'
import type { StaffOrderView } from '@/lib/orders/staff-view'

/**
 * Read-only — every order here is in a terminal state (collected, cancelled,
 * payment_failed), so none of `staffActionsForState`'s buttons ever apply.
 * No live polling either: unlike the Orders tab, nothing here changes on
 * its own while the tab is open. Search, period and page all compose as one
 * request to /api/staff/orders/history; export bypasses search on purpose
 * (see the route's own comment) but shares the same period.
 */
export function StaffOrderHistory({
  initialHistory,
  initialHistoryTotal,
}: {
  initialHistory: StaffOrderView[]
  initialHistoryTotal: number
}) {
  const [orders, setOrders] = useState(initialHistory)
  const [total, setTotal] = useState(initialHistoryTotal)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState<HistoryPeriod>('all')
  const [page, setPage] = useState(1)

  async function fetchHistory(nextSearch: string, nextPeriod: HistoryPeriod, nextPage: number) {
    const params = new URLSearchParams()
    if (nextSearch.trim()) params.set('code', nextSearch.trim())
    if (nextPeriod !== 'all') params.set('period', nextPeriod)
    params.set('page', String(nextPage))

    const response = await fetch(`/api/staff/orders/history?${params}`, { cache: 'no-store' })
    if (response.ok) {
      const data: { orders: StaffOrderView[]; total: number } = await response.json()
      setOrders(data.orders)
      setTotal(data.total)
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
    fetchHistory(value, period, 1)
  }

  function handlePeriodChange(next: HistoryPeriod) {
    setPeriod(next)
    setPage(1)
    fetchHistory(search, next, 1)
  }

  function handlePageChange(next: number) {
    setPage(next)
    fetchHistory(search, period, next)
  }

  const totalPages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE))
  const currentPeriodLabel = HISTORY_PERIODS.find((option) => option.id === period)?.label ?? 'All time'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search by pickup code"
          aria-label="Search by pickup code"
          className="border-hairline rounded-input text-body max-w-sm border p-3"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* A real file download (Content-Disposition: attachment), not a page — next/link would try to
              client-route it instead of letting the browser save the response. */}
          <a
            href={`/api/staff/orders/history/export?period=${period}`}
            className="border-hairline rounded-full border px-4 py-2 text-body font-semibold"
          >
            Export {period === 'all' ? 'all time' : currentPeriodLabel.toLowerCase()}
          </a>
          {period !== 'all' ? (
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a href="/api/staff/orders/history/export?period=all" className="text-accent text-body font-semibold">
              Export all time
            </a>
          ) : null}
        </div>
      </div>

      <div role="radiogroup" aria-label="Period" className="flex flex-wrap gap-2">
        {HISTORY_PERIODS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selectionRole="radio"
            selected={period === option.id}
            onClick={() => handlePeriodChange(option.id)}
          />
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-body text-secondary py-8 text-center">
          {search.trim() ? 'No order found for that pickup code.' : 'No completed orders in this period.'}
        </p>
      ) : (
        <>
          <div className="border-hairline bg-raised rounded-tile overflow-x-auto border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-hairline text-spec wdth-condensed text-secondary border-b">
                  <th className="p-3 font-medium">Code</th>
                  <th className="p-3 font-medium">Items</th>
                  <th className="p-3 text-right font-medium">Total</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-hairline divide-y">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="p-3 align-top">
                      <span className="text-item">{order.pickupCode}</span>
                    </td>
                    <td className="text-body text-secondary p-3 align-top">
                      {order.lines.map((line) => `${line.quantity}× ${line.name}`).join(', ')}
                    </td>
                    <td className="text-price p-3 text-right align-top whitespace-nowrap">
                      {formatSBD(order.total)}
                    </td>
                    <td className="p-3 align-top">
                      <Tag variant={staffStateTagVariant(order.state)}>{STAFF_STATE_LABEL[order.state]}</Tag>
                      {order.cancelReason ? (
                        <p className="text-small text-tertiary mt-1">{order.cancelReason}</p>
                      ) : null}
                    </td>
                    <td className="text-small text-tertiary p-3 align-top whitespace-nowrap" suppressHydrationWarning>
                      {new Date(order.updatedAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-small text-secondary">
                Page {page} of {totalPages} · {total} order{total === 1 ? '' : 's'}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
