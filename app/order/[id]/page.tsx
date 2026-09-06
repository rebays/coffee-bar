import { notFound } from 'next/navigation'

import { OrderStatusPoller } from '@/components/order/order-status-poller'
import { getOrder } from '@/lib/orders/store'
import { toStatusView } from '@/lib/orders/status-view'

/**
 * The order id in the URL is what makes this survive a closed tab per
 * docs/PAYMENTS.md §7.7 — reopening this exact URL always re-renders the
 * order from the server-side store, regardless of what the browser did to
 * the tab in between. No access check beyond the id itself: the pickup
 * code screen already doubles as the receipt, so the URL is the credential.
 */
export default async function OrderPage(props: PageProps<'/order/[id]'>) {
  const { id } = await props.params
  const order = getOrder(id)
  if (!order) notFound()

  return (
    <main
      className="mx-auto w-full flex-1"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <h1 className="sr-only">Order status</h1>
      <OrderStatusPoller initial={toStatusView(order)} />
    </main>
  )
}
