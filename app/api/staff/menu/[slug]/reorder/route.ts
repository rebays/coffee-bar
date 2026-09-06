import { NextResponse } from 'next/server'

import { reorderMenuItem } from '@/lib/menu-store'
import type { ReorderDirection } from '@/lib/menu-store'
import { getStaffSession } from '@/lib/staff-auth'

const DIRECTIONS: ReorderDirection[] = ['up', 'down']

/** Moves an item up or down within its own category block. Returns the full, current order. */
export async function POST(request: Request, ctx: RouteContext<'/api/staff/menu/[slug]/reorder'>) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const direction = body && typeof body === 'object' ? (body as Record<string, unknown>).direction : undefined
  if (typeof direction !== 'string' || !DIRECTIONS.includes(direction as ReorderDirection)) {
    return NextResponse.json({ error: 'invalid_direction' }, { status: 400 })
  }

  const { slug } = await ctx.params
  const items = reorderMenuItem(slug, direction as ReorderDirection)

  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } })
}
