'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { RecentOrdersDrawer } from '@/components/order/recent-orders-drawer'
import { ClickSpark } from '@/components/ui/click-spark'
import { useCartSummary } from '@/lib/cart-store'
import { formatSBD, formatSBDSpoken } from '@/lib/money'

/**
 * The app's persistent bottom bar: "Recent orders" (opens the past-orders
 * drawer), a floating centre "Menu" circle (a real link to /menu — the one
 * action worth a second visual weight, since it's how you get back to
 * ordering from anywhere), and "Cart" (a real link to /cart, carrying the
 * live item count and total). Supersedes the old cart-only bar and the
 * separate floating RecentOrdersLauncher pill, which duplicated this same
 * screen edge.
 *
 * The centre column is a fixed-width grid cell reserved for the circle, not
 * flex space the side buttons could grow into — Cart's label is the longest
 * and most variable text in the bar (it carries the live total), so the gap
 * has to be structural, not incidental.
 *
 * The third action, Account/Sign in, is hidden for now (identity is still
 * unresolved — docs/CLAUDE.md's open question 2) — /login and /account stay
 * live at their own URLs, this just doesn't advertise them.
 *
 * Edge-to-edge black, matching the rest of the system's structure surfaces
 * (status strip) rather than a floating card — black is structure here, not
 * a decorative container.
 *
 * Hidden on:
 * - / (the pre-menu service-type gate — no navigation surface yet)
 * - any /item/* route (the sheet's backdrop covers it, and it would
 *   otherwise collide with that route's own sticky footer at the same edge)
 * - /cart (its own submit footer is a plain `sticky bottom-0` with no space
 *   reserved for a second fixed bar — this one would float on top of
 *   "Place order", the single most important tap target in the app; the old
 *   CartBar hid here for the same reason)
 * - /staff and /kitchen — internal, non-customer surfaces that never had a
 *   customer nav bar before and don't reserve bottom padding for one
 * Visible everywhere else, including /orders — this is navigation, not a
 * shortcut that should hide at its own destination.
 */
export function BottomNav() {
  const pathname = usePathname()
  const { itemCount, total } = useCartSummary()
  const [recentOrdersOpen, setRecentOrdersOpen] = useState(false)

  const hidden =
    pathname === '/' ||
    pathname === '/cart' ||
    pathname === '/staff' ||
    pathname === '/kitchen' ||
    pathname?.startsWith('/item/')
  if (hidden) {
    return null
  }

  const cartLabel =
    itemCount > 0
      ? `Cart • ${itemCount} ${itemCount === 1 ? 'item' : 'items'} • SBD ${formatSBD(total)}`
      : 'Cart'

  const actionClass =
    'tap-expand flex min-w-0 w-full flex-row items-center justify-center gap-1.5 rounded-tile text-small font-semibold'

  return (
    <>
      <nav
        aria-label="Primary"
        className={[
          'bg-structure text-on-structure safe-bottom shadow-float px-gutter print:hidden',
          'fixed inset-x-0 bottom-0 z-20 grid grid-cols-[1fr_4.5rem_1fr] items-center gap-2',
        ].join(' ')}
        // 4rem to match the space every page already reserves at its own
        // bottom edge (see app/menu/page.tsx's paddingBlockEnd) — a fixed
        // height, not padding-driven, so that reservation stays correct
        // regardless of label length or line count. The centre column is a
        // fixed 4.5rem, not a flex share — see the component doc comment.
        style={{ blockSize: '4rem' }}
      >
        <button
          type="button"
          onClick={() => setRecentOrdersOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={recentOrdersOpen}
          className={actionClass}
        >
          <ClockIcon />
          {/* min-w-0 is load-bearing here: a flex item's default min-width
              is its content size, so without it `truncate` never actually
              clips — the label just overflows the button instead of
              ellipsizing, breaking the single-line layout on narrow phones. */}
          <span className="min-w-0 truncate">Recent orders</span>
        </button>

        {/* The one circle in a system where "anything you press is fully
            round" — floating half out of the bar is what makes it read as
            the primary action rather than a third equal tab. */}
        <div className="relative h-full">
          <div className="absolute left-1/2 top-[-1.25rem] -translate-x-1/2">
            <ClickSpark className="block h-14 w-14 rounded-full">
              <Link
                href="/menu"
                aria-label="Menu"
                className="tap-expand bg-accent text-on-accent shadow-raise animate-menu-pulse flex h-14 w-14 items-center justify-center rounded-full"
              >
                <MenuIcon />
              </Link>
            </ClickSpark>
          </div>
        </div>

        <Link
          href="/cart"
          aria-label={
            itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your order, total ${formatSBDSpoken(total)}. Go to cart.`
              : 'Cart, empty. Go to cart.'
          }
          className={actionClass}
        >
          <span className="relative inline-flex shrink-0">
            <CartIcon />
            {itemCount > 0 ? (
              <span
                key={itemCount}
                aria-hidden="true"
                className="animate-badge-pop bg-danger text-on-danger absolute -end-1.5 -top-1.5 inline-flex items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold"
                style={{ minInlineSize: '1rem', blockSize: '1rem' }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            ) : null}
          </span>
          <span className="min-w-0 truncate">{cartLabel}</span>
        </Link>
      </nav>

      {recentOrdersOpen ? <RecentOrdersDrawer onClose={() => setRecentOrdersOpen(false)} /> : null}
    </>
  )
}

function MenuIcon() {
  // Same coffee-cup glyph as the coffee category (components/menu/category-icon.tsx)
  // — this button's destination is the menu, so it borrows the one icon in the
  // system that already means "coffee" rather than inventing a new mark.
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" className="shrink-0">
      <path
        d="M5 9h11v5a5 5 0 0 1-5 5H9a4 4 0 0 1-4-4V9Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 10.5h1.25a2.25 2.25 0 0 1 0 4.5H16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 4.5c.5 1 .5 1.5 0 2.5M12 4.5c.5 1 .5 1.5 0 2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="none" className="shrink-0">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.75V8l2.25 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="none" className="shrink-0">
      <path
        d="M2 4h1.6l.5 2M4.1 6l1 6.2a1 1 0 0 0 1 .8h5a1 1 0 0 0 1-.8L13.2 6H4.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="14" r="0.9" fill="currentColor" />
      <circle cx="11" cy="14" r="0.9" fill="currentColor" />
    </svg>
  )
}
