import { NextResponse } from 'next/server'

import { transitionOrder } from '@/lib/orders/store'
import { STAFF_ACTION_TARGET_STATE, toStaffOrderView } from '@/lib/orders/staff-view'
import type { StaffAction } from '@/lib/orders/staff-view'
import { START_MAKING_BEFORE_PAYMENT } from '@/lib/shop-state'
import { getStaffSession } from '@/lib/staff-auth'

function isStaffAction(value: unknown): value is StaffAction {
  return typeof value === 'string' && value in STAFF_ACTION_TARGET_STATE
}

/** Every transition here carries the logged-in staff member as actor, per step 10. */
export async function PATCH(request: Request, ctx: RouteContext<'/api/staff/orders/[id]'>) {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const action = body && typeof body === 'object' ? (body as Record<string, unknown>).action : undefined
  if (!isStaffAction(action)) {
    return NextResponse.json({ error: 'invalid_action' }, { status: 400 })
  }

  const reasonRaw = body && typeof body === 'object' ? (body as Record<string, unknown>).reason : undefined
  const reason = typeof reasonRaw === 'string' && reasonRaw.trim() ? reasonRaw.trim() : undefined

  const { id } = await ctx.params
  const result = transitionOrder(
    id,
    STAFF_ACTION_TARGET_STATE[action],
    { type: 'staff', staffId: session.staffName },
    { startMakingBeforePayment: START_MAKING_BEFORE_PAYMENT, reason },
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.error === 'not_found' ? 404 : 409 })
  }

  return NextResponse.json(toStaffOrderView(result.order), { headers: { 'Cache-Control': 'no-store' } })
}
