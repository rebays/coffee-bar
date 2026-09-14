import { Suspense } from 'react'

import { ClosedNotice } from '@/components/menu/closed-notice'
import { MenuBody } from '@/components/menu/menu-body'
import { ServiceTypeSync } from '@/components/menu/service-type-sync'
import { StatusStrip } from '@/components/menu/status-strip'
import { SiteHeader } from '@/components/site-header'
import { getCategories } from '@/lib/category-store'
import { getMenuItems } from '@/lib/menu-store'
import type { ServiceType } from '@/lib/service-context'
import { peekServiceContext } from '@/lib/service-context-server'
import { getShopState } from '@/lib/shop-state'

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/**
 * The actual menu screen — what used to live at `/`. Reads mode/table from
 * the URL (a fresh QR scan) with the persisted cookie as a fallback (a
 * bare /menu visit later in the same session), URL taking priority since a
 * new scan is a deliberate, fresher instruction than whatever was there
 * before. ServiceTypeSync is what turns "URL has it this one request" into
 * "cookie has it from now on."
 */
export default async function MenuPage(props: PageProps<'/menu'>) {
  const params = await props.searchParams
  const shopState = getShopState()
  const cookieContext = await peekServiceContext()

  const modeParam = firstValue(params.mode)
  const serviceType: ServiceType | undefined =
    modeParam === 'dine-in' || modeParam === 'takeaway' ? modeParam : (cookieContext.serviceType ?? undefined)
  const tableNumber = firstValue(params.table) ?? cookieContext.tableNumber ?? undefined

  return (
    <main
      className="mx-auto w-full flex-1"
      style={{
        maxInlineSize: 'var(--container-menu)',
        // Reserves space for the floating cart bar (64px + safe area) so the
        // last row is never hidden behind it. Reserved unconditionally since
        // the bar's own visibility is client-side state the page can't see.
        paddingBlockEnd: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* The document title already reads the shop's name — this labels the
          screen for assistive tech without duplicating that visually. */}
      <h1 className="sr-only">Menu</h1>
      <SiteHeader />
      <Suspense fallback={null}>
        <ServiceTypeSync />
      </Suspense>
      <ClosedNotice isOpen={shopState.isOpen} opensAt={shopState.opensAt} />
      <StatusStrip state={shopState} serviceType={serviceType} tableNumber={tableNumber} />
      <MenuBody items={getMenuItems()} categories={getCategories()} orderingDisabled={!shopState.isOpen} />
    </main>
  )
}
