import { NextResponse } from 'next/server'

import { deleteCategory, renameCategory } from '@/lib/category-store'
import { getMenuItems } from '@/lib/menu-store'
import { getStaffSession } from '@/lib/staff-auth'

/** Renames a category — its id (and every item's `category` field) is unchanged, only the label. */
export async function PUT(request: Request, ctx: RouteContext<'/api/staff/categories/[id]'>) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { label?: unknown } | null
  const label = typeof body?.label === 'string' ? body.label.trim() : ''
  if (!label) return NextResponse.json({ error: 'label is required' }, { status: 400 })

  const { id } = await ctx.params
  const updated = renameCategory(id, label)
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json(updated, { headers: { 'Cache-Control': 'no-store' } })
}

/**
 * Removes a category — refused while any menu item still references it, the
 * same "can't delete what's in use" guard an option group or provider id
 * would need if this app let those be deleted. The check lives here rather
 * than in lib/category-store.ts to avoid that module importing
 * lib/menu-store.ts back (menu-store already imports category-store for
 * category ordering).
 */
export async function DELETE(_request: Request, ctx: RouteContext<'/api/staff/categories/[id]'>) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const itemCount = getMenuItems().filter((item) => item.category === id).length
  if (itemCount > 0) {
    return NextResponse.json(
      { error: `category still has ${itemCount} item${itemCount === 1 ? '' : 's'} — move or delete them first` },
      { status: 409 },
    )
  }

  const deleted = deleteCategory(id)
  if (!deleted) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
