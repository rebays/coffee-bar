import { mkdir, writeFile } from 'fs/promises'
import { NextResponse } from 'next/server'
import path from 'path'

import { getStaffSession } from '@/lib/staff-auth'

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const MAX_BYTES = 5 * 1024 * 1024 // 5MB — a phone photo, not a print asset

/**
 * Writes straight to `public/uploads/menu/`, served at `/uploads/menu/...`
 * the same way any other file under `public/` is — no separate static
 * route needed. Like the rest of this app's storage (lib/menu-store.ts,
 * lib/orders/store.ts), this has no cleanup story yet: replacing or
 * deleting an item's photo leaves the old file on disk. Acceptable for the
 * same phase-1 reason those stores are in-memory rather than a database —
 * revisit together if a real asset pipeline is ever built.
 */
export async function POST(request: Request) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const formData = await request.formData().catch(() => null)
  const file = formData?.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 })
  }

  const extension = EXTENSION_BY_TYPE[file.type]
  if (!extension) {
    return NextResponse.json({ error: 'file must be a PNG, JPEG, WEBP or GIF image' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file must be 5MB or smaller' }, { status: 400 })
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', 'menu')
  await mkdir(dir, { recursive: true })

  const filename = `${crypto.randomUUID()}.${extension}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(dir, filename), buffer)

  return NextResponse.json({ url: `/uploads/menu/${filename}` }, { status: 201 })
}
