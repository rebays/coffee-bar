import { NextResponse } from 'next/server'

import { setSoldOut } from '@/lib/menu-store'
import { getStaffSession } from '@/lib/staff-auth'

/** Toggles a menu item's sold-out flag — docs/CLAUDE.md decision 4. */
export async function PATCH(request: Request, ctx: RouteContext<'/api/staff/menu/[slug]'>) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const soldOut = body && typeof body === 'object' ? (body as Record<string, unknown>).soldOut : undefined
  if (typeof soldOut !== 'boolean') {
    return NextResponse.json({ error: 'invalid_sold_out' }, { status: 400 })
  }

  const { slug } = await ctx.params
  const updated = setSoldOut(slug, soldOut)
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json(updated, { headers: { 'Cache-Control': 'no-store' } })
}
