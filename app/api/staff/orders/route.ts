import { NextResponse } from 'next/server'

import { listOrders } from '@/lib/orders/store'
import { LIVE_STATES, toStaffOrderView } from '@/lib/orders/staff-view'
import { getStaffSession } from '@/lib/staff-auth'

/** Polled by the staff dashboard — see staff-dashboard.tsx. */
export async function GET(request: Request) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const code = new URL(request.url).searchParams.get('code')?.trim()
  const orders = code ? listOrders({ pickupCode: code }) : listOrders({ states: LIVE_STATES })

  return NextResponse.json(
    { orders: orders.map(toStaffOrderView) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
