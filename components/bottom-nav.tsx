'use client'

import { House, ReceiptText, Search, UserRound, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { focusMenuSearch } from '@/components/menu/search-bar'

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  /** Which pathnames count as "here" for aria-current and the active colour. */
  isActive: (pathname: string) => boolean
}

const ITEMS: NavItem[] = [
  { label: 'Home', href: '/menu', icon: House, isActive: (p) => p === '/menu' || p === '/categories' },
  // Never "active" — it's an action on the menu page, not a place.
  { label: 'Search', href: '/menu#search', icon: Search, isActive: () => false },
  { label: 'Orders', href: '/orders', icon: ReceiptText, isActive: (p) => p.startsWith('/order') },
  {
    label: 'Profile',
    href: '/account',
    icon: UserRound,
    isActive: (p) => p.startsWith('/account') || p.startsWith('/login'),
  },
]

/**
 * The app's fixed bottom bar: Home, Search, Orders, Profile. Four equal
 * columns, icon over label, so every target is well past 44×44. The current
 * place is marked by the accent colour *and* a semibold label *and*
 * `aria-current` — never colour alone. The cart lives in the header
 * (components/cart/cart-button.tsx), since this bar has no cart tab.
 *
 * Search, tapped on /menu itself, focuses the search field in place; from
 * anywhere else it links to `/menu#search`, which SearchBar focuses on load.
 *
 * Hidden on:
 * - any /item/* route (the sheet's backdrop covers it, and it would
 *   otherwise collide with that route's own sticky footer at the same edge)
 * - /cart (its floating checkout sits at this same edge — this bar would
 *   cover "Place order", the most important tap target in the app)
 * - /staff and /kitchen — internal surfaces that don't reserve bottom
 *   padding for a customer nav bar
 */
export function BottomNav() {
  const pathname = usePathname() ?? ''

  const hidden =
    pathname === '/cart' || pathname === '/staff' || pathname === '/kitchen' || pathname.startsWith('/item/')
  if (hidden) return null

  return (
    <nav
      aria-label="Primary"
      className={[
        'bg-structure text-on-structure border-hairline shadow-float safe-bottom border-t print:hidden',
        'fixed inset-x-0 bottom-0 z-20',
      ].join(' ')}
    >
      {/* 4rem, matching the space every page reserves at its own bottom edge
          (see app/menu/page.tsx's paddingBlockEnd). */}
      <ul className="mx-auto grid grid-cols-4" style={{ blockSize: '4rem', maxInlineSize: 'var(--container-menu)' }}>
        {ITEMS.map((item) => {
          const active = item.isActive(pathname)
          const Icon = item.icon
          return (
            <li key={item.label} className="flex">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={(event) => {
                  if (item.label === 'Search' && pathname === '/menu' && focusMenuSearch()) {
                    event.preventDefault()
                  }
                }}
                className={[
                  'text-spec flex flex-1 flex-col items-center justify-center gap-1 leading-none',
                  'transition-colors duration-(--dur-fast) ease-(--ease-standard)',
                  // text-accent, not text-brand: the brand teal is 3.7:1 on white,
                  // under the floor for a 12px label.
                  active ? 'text-accent font-semibold' : 'text-tertiary hover:text-primary font-medium',
                ].join(' ')}
              >
                <Icon size={22} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
