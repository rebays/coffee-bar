import Link from 'next/link'

import { OrderHistoryCard } from '@/components/order/order-history-card'
import { peekDeviceToken } from '@/lib/device-token'
import { toHistoryView } from '@/lib/orders/history-view'
import { listOrders } from '@/lib/orders/store'

/**
 * Scoped by the same anonymous device-token cookie /order/[id] already uses
 * to survive a closed tab — a visitor who has never placed an order (no
 * cookie yet) sees the empty state rather than every order in the shop.
 */
export default async function OrdersPage() {
  const deviceToken = await peekDeviceToken()
  const orders = deviceToken ? listOrders({ deviceToken }) : []

  if (orders.length === 0) {
    return (
      <main className="px-gutter flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <h1 className="sr-only">Your orders</h1>
        <p className="text-body text-secondary">No past orders yet.</p>
        <Link href="/menu" className="text-accent text-body font-semibold">
          Browse the menu
        </Link>
      </main>
    )
  }

  return (
    <main
      className="mx-auto flex w-full flex-1 flex-col"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <div className="px-gutter flex items-center gap-2 pt-4">
        <Link
          href="/menu"
          aria-label="Back to menu"
          className="tap-expand text-secondary inline-flex items-center justify-center rounded-full"
          style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
        >
          <BackArrow />
        </Link>
        <h1 className="text-title">Your orders</h1>
      </div>

      <ul className="px-gutter flex flex-1 flex-col gap-3 py-4">
        {orders.map((order) => (
          <OrderHistoryCard key={order.id} order={toHistoryView(order)} />
        ))}
      </ul>
    </main>
  )
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M10 3L5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
