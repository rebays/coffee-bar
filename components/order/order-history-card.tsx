'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { addToCart } from '@/lib/cart-store'
import { formatSBD, formatSBDSpoken } from '@/lib/money'
import { historyStateLabel, historyStateTagVariant } from '@/lib/orders/history-view'
import type { OrderHistoryView, ReorderLine } from '@/lib/orders/history-view'
import { resolveCartLine } from '@/lib/resolve-cart-line'
import { showToast } from '@/lib/toast-store'

/**
 * One past order. Reorder re-resolves each line against the *current* menu
 * client-side (lib/resolve-cart-line.ts has no 'use client' but is plain,
 * side-effect-free logic, safe to call from either side) — an item that's
 * been removed or gone sold-out since is dropped rather than failing the
 * whole reorder, the same partial-success shape place-order.ts already uses.
 */
export function OrderHistoryCard({ order }: { order: OrderHistoryView }) {
  const router = useRouter()
  const [reordering, setReordering] = useState(false)

  async function handleReorder() {
    setReordering(true)
    try {
      const response = await fetch(`/api/reorder?orderId=${order.id}`, { cache: 'no-store' })
      if (!response.ok) {
        showToast('Could not reorder — try again.')
        return
      }
      const { lines }: { lines: ReorderLine[] } = await response.json()

      let added = 0
      for (const line of lines) {
        const resolved = resolveCartLine(line.slug, line.choices, line.quantity)
        if (!resolved || resolved.item.soldOut) continue
        addToCart(line.slug, line.choices, line.quantity, line.notes)
        added++
      }

      if (added === 0) {
        showToast('Those items are no longer on the menu.')
        return
      }
      showToast(added < lines.length ? 'Added what’s still available' : 'Added to cart')
      router.push('/cart')
    } finally {
      setReordering(false)
    }
  }

  return (
    <li className="border-hairline rounded-tile flex flex-col gap-3 border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-title">{order.pickupCode}</p>
          <p className="text-small text-tertiary mt-1">
            {new Date(order.createdAt).toLocaleString([], {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Tag variant={historyStateTagVariant(order.state)}>{historyStateLabel(order.state)}</Tag>
      </div>

      <ul className="flex flex-col gap-1">
        {order.lines.map((line, index) => (
          <li key={index} className="text-body flex flex-col gap-0.5">
            <div className="flex items-baseline justify-between gap-4">
              <span>
                {line.quantity} × {line.name}
                {line.customizations.length > 0 ? (
                  <span className="text-secondary"> ({line.customizations.join(', ')})</span>
                ) : null}
              </span>
              <span className="text-price shrink-0">{formatSBD(line.lineTotal)}</span>
            </div>
            {line.notes ? <p className="tasting-note">“{line.notes}”</p> : null}
          </li>
        ))}
      </ul>

      <div className="border-hairline flex items-center justify-between border-t pt-2">
        <span className="text-body text-secondary">Total</span>
        <span className="text-price" aria-label={formatSBDSpoken(order.total)}>
          {formatSBD(order.total)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="md" disabled={reordering} onClick={handleReorder}>
          {reordering ? 'Adding…' : 'Make another order'}
        </Button>
        {/* A real link, not a Button, so it can target a new tab — the
            receipt is a route, not an in-page action. */}
        <Link
          href={`/orders/${order.id}/receipt`}
          target="_blank"
          className="border-hairline text-primary hover:bg-sunken text-body inline-flex items-center justify-center rounded-full border px-4 font-semibold"
          style={{ blockSize: 'var(--control-md)' }}
        >
          Print receipt
        </Link>
      </div>
    </li>
  )
}
