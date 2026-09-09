import { NextResponse } from 'next/server'

import { isDemoModeEnabled } from '@/lib/demo-mode-store'
import { getShopState } from '@/lib/shop-state'

/**
 * Public, read-only — operating hours aren't sensitive, and knowing demo
 * mode is on isn't either (the toggle itself stays staff-only, at
 * /api/staff/demo-mode). Polled by the cart page so the Place order button
 * can disable itself proactively instead of only erroring after a submit
 * attempt (lib/actions/place-order.ts already rejects server-side either
 * way; this is just the up-front UI for it), and so it knows whether to
 * offer "Pay with M-SELEN" at all.
 */
export async function GET() {
  return NextResponse.json(
    { ...getShopState(), demoMode: isDemoModeEnabled() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
