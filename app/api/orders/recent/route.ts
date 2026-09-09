import { NextResponse } from 'next/server'

import { peekDeviceToken } from '@/lib/device-token'
import { toHistoryView } from '@/lib/orders/history-view'
import { listOrders } from '@/lib/orders/store'

/** How many past orders the drawer shows — a quick-access list, not the full /orders page. */
const RECENT_LIMIT = 10

/**
 * Read-only, same device-token scoping as /orders — feeds the Recent Orders
 * drawer. A visitor with no device-token cookie yet gets an empty list, not
 * an error: they simply have no orders to show.
 */
export async function GET() {
  const deviceToken = await peekDeviceToken()
  const orders = deviceToken ? listOrders({ deviceToken }).slice(0, RECENT_LIMIT) : []

  return NextResponse.json(
    { orders: orders.map(toHistoryView) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
