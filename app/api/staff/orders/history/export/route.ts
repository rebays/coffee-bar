import { NextResponse } from 'next/server'

import { formatSBD } from '@/lib/money'
import { listOrders } from '@/lib/orders/store'
import { STAFF_STATE_LABEL } from '@/lib/orders/status-view'
import { HISTORY_STATES } from '@/lib/orders/staff-view'
import { isHistoryPeriod, periodStart } from '@/lib/orders/period'
import { getStaffSession } from '@/lib/staff-auth'

/** Wraps a field in quotes only if it needs it — the common case (a name, a code) stays plain and readable. */
function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/**
 * A real file download, not a preview — staff open this in a spreadsheet.
 * Scoped by `period` alone, ignoring any pickup-code search the History tab
 * might have active: "export the day/week/month/everything" is the actual
 * ask, not "export whatever's currently filtered on screen."
 */
export async function GET(request: Request) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const periodParam = new URL(request.url).searchParams.get('period')
  const period = isHistoryPeriod(periodParam) ? periodParam : 'all'

  let orders = listOrders({ states: HISTORY_STATES })
  const start = periodStart(period)
  if (start) orders = orders.filter((order) => new Date(order.createdAt) >= start)

  const header = ['Pickup code', 'Placed at', 'Completed at', 'Status', 'Items', 'Total (SBD)', 'Cancel reason']
  const rows = orders.map((order) => [
    order.pickupCode,
    order.createdAt,
    order.updatedAt,
    STAFF_STATE_LABEL[order.state],
    order.lines.map((line) => `${line.quantity}x ${line.name}`).join('; '),
    formatSBD(order.total, { symbol: false }),
    order.cancelReason ?? '',
  ])

  const csv = [header, ...rows].map((row) => row.map(csvField).join(',')).join('\r\n')
  const filename = `orders-${period}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
