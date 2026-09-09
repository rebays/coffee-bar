import { redirect } from 'next/navigation'

import { HomeServiceCards } from '@/components/home/home-service-cards'
import { StoreStatusBadge } from '@/components/home/store-status-badge'
import { getShopState } from '@/lib/shop-state'

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/**
 * QR entry point. A QR code encodes `?mode=` (and `?table=` for dine-in)
 * directly in its URL, so a scan never needs to see this screen at all —
 * it bypasses straight to /menu. This page only renders for someone who
 * opens the bare URL with no parameters, and exists to capture the one
 * thing a QR would otherwise have told us.
 *
 * The cards stay clickable regardless of open/closed — browsing (and
 * building a cart) is always allowed; only checkout itself is gated,
 * enforced where it actually matters: server-side in
 * lib/actions/place-order.ts, with the cart page disabling its own button
 * up front rather than only erroring after a tap.
 */
export default async function HomePage(props: PageProps<'/'>) {
  const params = await props.searchParams
  const mode = firstValue(params.mode)
  const table = firstValue(params.table)

  if (mode === 'takeaway') {
    redirect('/menu?mode=takeaway')
  }
  if (mode === 'dine-in' && table) {
    redirect(`/menu?mode=dine-in&table=${encodeURIComponent(table)}`)
  }

  const shopState = getShopState()

  return (
    <main
      className="px-gutter mx-auto flex w-full flex-1 flex-col items-center justify-center gap-8 py-12 text-center"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <StoreStatusBadge state={shopState} />
        <div>
          <h1 className="text-title">
            {shopState.isOpen ? 'Welcome to Coffee Bar!' : "We're currently closed"}
          </h1>
          <p className="text-body text-secondary mt-2">
            {shopState.isOpen
              ? 'How are you ordering today?'
              : `We open bright and early at ${shopState.opensAt}. Feel free to browse our menu!`}
          </p>
        </div>
      </div>
      <HomeServiceCards />
    </main>
  )
}
