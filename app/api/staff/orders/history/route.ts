import { NextResponse } from 'next/server'

import { listOrders } from '@/lib/orders/store'
import { HISTORY_PAGE_SIZE, HISTORY_STATES, toStaffOrderView } from '@/lib/orders/staff-view'
import { isHistoryPeriod, periodStart } from '@/lib/orders/period'
import { getStaffSession } from '@/lib/staff-auth'

const MAX_PAGE_SIZE = 100

/** Read by the staff History tab — see staff-order-history.tsx. Filters compose: code AND period, then paginated. */
export async function GET(request: Request) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const params = new URL(request.url).searchParams
  const code = params.get('code')?.trim() || undefined
  const periodParam = params.get('period')
  const period = isHistoryPeriod(periodParam) ? periodParam : 'all'
  const page = Math.max(1, Math.trunc(Number(params.get('page')) || 1))
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(Number(params.get('pageSize')) || HISTORY_PAGE_SIZE)))

  let orders = listOrders({ states: HISTORY_STATES, pickupCode: code })

  const start = periodStart(period)
  if (start) orders = orders.filter((order) => new Date(order.createdAt) >= start)

  const total = orders.length
  const paged = orders.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json(
    { orders: paged.map(toStaffOrderView), total, page, pageSize },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
