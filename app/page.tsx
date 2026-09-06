import { Hero } from '@/components/menu/hero'
import { MenuBody } from '@/components/menu/menu-body'
import { StatusStrip } from '@/components/menu/status-strip'
import { MENU } from '@/lib/fixtures'
import { getShopState } from '@/lib/shop-state'

export default function Home() {
  const shopState = getShopState()

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
      {/* The document title already reads "Coffee Bar" — this labels the
          screen for assistive tech without duplicating that visually. */}
      <h1 className="sr-only">Menu</h1>
      <StatusStrip state={shopState} />
      <Hero state={shopState} />
      <MenuBody items={MENU} orderingDisabled={!shopState.isOpen} />
    </main>
  )
}
