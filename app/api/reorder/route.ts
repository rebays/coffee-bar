import { NextResponse } from 'next/server'

import { toHistoryView } from '@/lib/orders/history-view'
import { getOrder } from '@/lib/orders/store'

/**
 * Read-only. Same access model as /api/orders/[id]: docs/PAYMENTS.md and
 * status-view.ts are explicit that a customer-facing order read needs no
 * check beyond the id itself. There is no server-side cart to write into —
 * lib/cart-store.ts lives in the browser tab, so the client fetches these
 * lines and calls addToCart itself.
 */
export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get('orderId')
  if (!orderId) {
    return NextResponse.json({ error: 'missing_order_id' }, { status: 400 })
  }

  const order = getOrder(orderId)
  if (!order) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json(
    { lines: toHistoryView(order).reorderLines },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
