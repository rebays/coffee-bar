import { NextResponse } from 'next/server'

import { parseMenuItemFields } from '@/lib/menu-item-input'
import { deleteMenuItem, setSoldOut, updateMenuItem } from '@/lib/menu-store'
import { getStaffSession } from '@/lib/staff-auth'

/** Toggles a menu item's sold-out flag — the fast, day-to-day control from step 10. */
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
