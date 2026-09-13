import { NextResponse } from 'next/server'

import { getWeeklyHours, isValidDayHours, setWeeklyHours } from '@/lib/shop-hours-store'
import type { WeeklyHours } from '@/lib/shop-hours-store'
import { getStaffSession } from '@/lib/staff-auth'

export async function GET() {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  return NextResponse.json(getWeeklyHours(), { headers: { 'Cache-Control': 'no-store' } })
}

/** Staff-only — docs/BUILD-PLAN.md's fixed schedule, made editable. */
export async function POST(request: Request) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as Partial<WeeklyHours> | null
  if (!body || !isValidDayHours(body.weekday) || !isValidDayHours(body.weekend)) {
    return NextResponse.json({ error: 'invalid_hours' }, { status: 400 })
  }

  setWeeklyHours({ weekday: body.weekday, weekend: body.weekend })
  return NextResponse.json(getWeeklyHours())
}
