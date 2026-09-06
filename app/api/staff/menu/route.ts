import { NextResponse } from 'next/server'

import { createMenuItem, getMenuItems } from '@/lib/menu-store'
import { parseMenuItemFields } from '@/lib/menu-item-input'
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

/** Creates a new menu item — full catalog management, per docs/CLAUDE.md decision 4. */
export async function POST(request: Request) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const result = parseMenuItemFields(body)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  const item = createMenuItem(result.fields)
  return NextResponse.json(item, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}
