import { NextResponse } from 'next/server'

import { getShopState } from '@/lib/shop-state'
import { getStoreOverride, setStoreOverride } from '@/lib/shop-override-store'
import type { StoreOverride } from '@/lib/shop-override-store'
import { getStaffSession } from '@/lib/staff-auth'

const VALID_OVERRIDES: readonly StoreOverride[] = ['AUTO', 'FORCE_OPEN', 'FORCE_CLOSED']

export async function GET() {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  return NextResponse.json(
    { override: getStoreOverride(), computed: getShopState() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

/** Sets the manual override — staff-only, per docs/CLAUDE.md's `startMakingBeforePayment`-style flag pattern. */
export async function POST(request: Request) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { override?: unknown } | null
  const override = body?.override
  if (typeof override !== 'string' || !VALID_OVERRIDES.includes(override as StoreOverride)) {
    return NextResponse.json({ error: 'invalid_override' }, { status: 400 })
  }

  setStoreOverride(override as StoreOverride)
  return NextResponse.json({ override: getStoreOverride(), computed: getShopState() })
}
