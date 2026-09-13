import { NextResponse } from 'next/server'

import { createCategory, getCategories } from '@/lib/category-store'
import { getStaffSession } from '@/lib/staff-auth'

/** Read by the staff inventory toolbar and the menu-item form's category picker. */
export async function GET() {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  return NextResponse.json({ categories: getCategories() }, { headers: { 'Cache-Control': 'no-store' } })
}

/** Adds a category to the taxonomy — staff catalog management, per docs/CLAUDE.md decision 4. */
export async function POST(request: Request) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { label?: unknown } | null
  const label = typeof body?.label === 'string' ? body.label.trim() : ''
  if (!label) return NextResponse.json({ error: 'label is required' }, { status: 400 })

  const category = createCategory(label)
  return NextResponse.json(category, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}
