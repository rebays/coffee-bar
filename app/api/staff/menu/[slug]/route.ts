import { NextResponse } from 'next/server'

import { parseMenuItemFields } from '@/lib/menu-item-input'
import { deleteMenuItem, setSoldOut, setTodaysSpecial, updateMenuItem } from '@/lib/menu-store'
import { getStaffSession } from '@/lib/staff-auth'

/**
 * The fast, day-to-day toggles from the inventory list: `{ soldOut }` (step
 * 10) or `{ todaysSpecial }` — one per request. Setting a new special moves
 * it off whichever item held it, so the client should treat every other
 * item's `todaysSpecial` as cleared when this one comes back `true`.
 */
export async function PATCH(request: Request, ctx: RouteContext<'/api/staff/menu/[slug]'>) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const { slug } = await ctx.params

  let updated
  if (typeof record.soldOut === 'boolean') {
    updated = setSoldOut(slug, record.soldOut)
  } else if (typeof record.todaysSpecial === 'boolean') {
    updated = setTodaysSpecial(slug, record.todaysSpecial)
  } else {
    return NextResponse.json({ error: 'invalid_toggle' }, { status: 400 })
  }
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json(updated, { headers: { 'Cache-Control': 'no-store' } })
}

/** Replaces a menu item's editable fields wholesale — the catalog edit form. */
export async function PUT(request: Request, ctx: RouteContext<'/api/staff/menu/[slug]'>) {
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

  const { slug } = await ctx.params
  const updated = updateMenuItem(slug, result.fields)
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json(updated, { headers: { 'Cache-Control': 'no-store' } })
}

/** Removes a menu item from the catalog entirely — not the same as marking it sold out. */
export async function DELETE(_request: Request, ctx: RouteContext<'/api/staff/menu/[slug]'>) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { slug } = await ctx.params
  const deleted = deleteMenuItem(slug)
  if (!deleted) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
