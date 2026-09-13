import { KitchenDashboard } from '@/components/kitchen/kitchen-dashboard'
import { StaffLoginForm } from '@/components/staff/staff-login-form'
import { listOrders } from '@/lib/orders/store'
import { toStaffOrderView } from '@/lib/orders/staff-view'
import { getStaffSession } from '@/lib/staff-auth'

/**
 * A second physical screen in the kitchen, not a customer surface — behind
 * the same staff auth as /staff, since it can drive real order transitions.
 * Rendered server-side so the dashboard has something to show before its
 * first poll, the same way app/staff/page.tsx seeds StaffDashboard.
 */
export default async function KitchenPage() {
  const session = await getStaffSession()
  if (!session) return <StaffLoginForm returnTo="/kitchen" />

  const initialOrders = listOrders({ states: ['paid', 'making', 'ready'] }).map(toStaffOrderView)

  return <KitchenDashboard initialOrders={initialOrders} />
}
