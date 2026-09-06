import { StaffDashboard } from '@/components/staff/staff-dashboard'
import { StaffLoginForm } from '@/components/staff/staff-login-form'
import { listOrders } from '@/lib/orders/store'
import { LIVE_STATES, toStaffOrderView } from '@/lib/orders/staff-view'
import { getStaffSession } from '@/lib/staff-auth'

/** Behind auth per docs/BUILD-PLAN.md step 10 — no session, no dashboard. */
export default async function StaffPage() {
  const session = await getStaffSession()

  if (!session) {
    return <StaffLoginForm />
  }

  // Rendered server-side so the dashboard has something to show before its
  // first poll, the same way OrderStatusPoller starts from a server-fetched
  // `initial` rather than an empty state.
  const initialOrders = listOrders({ states: LIVE_STATES }).map(toStaffOrderView)

  return <StaffDashboard staffName={session.staffName} initialOrders={initialOrders} />
}
