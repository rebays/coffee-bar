import Image from 'next/image'

import { HomeServiceCards } from '@/components/home/home-service-cards'
import { QrEntryCard } from '@/components/home/qr-entry-card'
import { StoreStatusBadge } from '@/components/home/store-status-badge'
import { getShopState } from '@/lib/shop-state'
import type { ServiceType } from '@/lib/service-context'

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/**
 * QR entry point. A QR code encodes `?mode=` (and `?table=` for dine-in)
 * directly in its URL — this page still renders for that visit (rather than
 * bypassing straight to /menu) so a scan always sees the store's open/closed
 * status first, just with the dine-in/takeaway choice already made for it
 * (QrEntryCard) instead of the two manual cards a bare visit gets.
 *
 * The cards/CTA stay clickable regardless of open/closed — browsing (and
 * building a cart) is always allowed; only checkout itself is gated,
 * enforced where it actually matters: server-side in
 * lib/actions/place-order.ts, with the cart page disabling its own button
 * up front rather than only erroring after a tap.
 */
export default async function HomePage(props: PageProps<'/'>) {
  const params = await props.searchParams
  const mode = firstValue(params.mode)
  const table = firstValue(params.table)

  const qrServiceType: ServiceType | undefined =
    mode === 'takeaway' ? 'takeaway' : mode === 'dine-in' && table ? 'dine-in' : undefined

  const shopState = getShopState()

  return (
    <main
      className="px-gutter mx-auto flex w-full flex-1 flex-col items-center justify-center gap-8 py-12 text-center"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <Image src="/logo.svg" alt="Coffee Bar" width={88} height={88} priority />
        <StoreStatusBadge state={shopState} />
        <div>
          <h1 className="text-title">
            {shopState.isOpen ? 'Welcome to Coffee Bar!' : "We're currently closed"}
          </h1>
          <p className="text-body text-secondary mt-2">
            {shopState.isOpen
              ? qrServiceType
                ? "You're all set — tap below when you're ready to order."
                : 'How are you ordering today?'
              : `We open bright and early at ${shopState.opensAt}. Feel free to browse our menu!`}
          </p>
        </div>
      </div>
      {qrServiceType ? (
        <QrEntryCard serviceType={qrServiceType} tableNumber={qrServiceType === 'dine-in' ? table : undefined} />
      ) : (
        <HomeServiceCards />
      )}
    </main>
  )
}
