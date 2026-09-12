import { NextResponse } from 'next/server'

import { getStaffStats } from '@/lib/orders/staff-stats'
import { getStaffSession } from '@/lib/staff-auth'

/** Polled by the staff dashboard's overview panel — see staff-dashboard.tsx. */
export async function GET() {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  return NextResponse.json(getStaffStats(), { headers: { 'Cache-Control': 'no-store' } })
}
