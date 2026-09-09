import { NextResponse } from 'next/server'

import { isDemoModeEnabled, setDemoMode } from '@/lib/demo-mode-store'
import { getStaffSession } from '@/lib/staff-auth'

export async function GET() {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  return NextResponse.json({ enabled: isDemoModeEnabled() }, { headers: { 'Cache-Control': 'no-store' } })
}

/** Staff-only toggle — never a customer-facing setting. */
export async function POST(request: Request) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { enabled?: unknown } | null
  if (typeof body?.enabled !== 'boolean') {
    return NextResponse.json({ error: 'invalid_enabled' }, { status: 400 })
  }

  setDemoMode(body.enabled)
  return NextResponse.json({ enabled: isDemoModeEnabled() })
}
