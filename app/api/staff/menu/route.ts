import { NextResponse } from 'next/server'

import { getMenuItems } from '@/lib/menu-store'
import { getStaffSession } from '@/lib/staff-auth'

/** Read once (or on demand) by the staff inventory tab — see staff-inventory-list.tsx. */
export async function GET() {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  return NextResponse.json(
    { items: getMenuItems() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
