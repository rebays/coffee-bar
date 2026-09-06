import { NextResponse } from 'next/server'

import { getOrder } from '@/lib/orders/store'
import { toStatusView } from '@/lib/orders/status-view'

/** Polled by the order status page's client component — see order-status-poller.tsx. */
export async function GET(_request: Request, ctx: RouteContext<'/api/orders/[id]'>) {
  const { id } = await ctx.params
  const order = getOrder(id)
  if (!order) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return NextResponse.json(toStatusView(order), { headers: { 'Cache-Control': 'no-store' } })
}
