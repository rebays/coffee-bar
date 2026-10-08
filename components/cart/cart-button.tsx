'use client'

import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

import { useCartSummary } from '@/lib/cart-store'
import { formatSBDSpoken } from '@/lib/money'

/**
 * The cart, from the header — the bottom nav (Home, Search, Orders, Profile)
 * has no cart tab, so this is the way in. The count badge pops in on every
 * change via a key remount (`animate-badge-pop` in globals.css).
 */
export function CartButton() {
  const { itemCount, total } = useCartSummary()

  return (
    <Link
      href="/cart"
      aria-label={
        itemCount > 0
          ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your order, total ${formatSBDSpoken(total)}. Go to cart.`
          : 'Cart, empty. Go to cart.'
      }
      className="surface-card text-primary hover:text-brand relative inline-flex size-11 shrink-0 items-center justify-center transition-colors duration-(--dur-fast) ease-(--ease-standard)"
      style={{ borderRadius: 'var(--radius-pill)' }}
    >
      <ShoppingBag size={20} strokeWidth={1.75} aria-hidden="true" />
      {itemCount > 0 ? (
        <span
          key={itemCount}
          aria-hidden="true"
          className="animate-badge-pop bg-accent text-on-accent absolute -end-1 -top-1 inline-flex items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold"
          style={{ minInlineSize: '1.125rem', blockSize: '1.125rem' }}
        >
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      ) : null}
    </Link>
  )
}
