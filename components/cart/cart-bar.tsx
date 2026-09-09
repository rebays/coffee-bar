'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useCartSummary } from '@/lib/cart-store'
import { formatSBD, formatSBDSpoken } from '@/lib/money'

/**
 * Black, floats above everything except an open item sheet, renders only
 * when the cart has items. The bar itself is one tap target through to
 * /cart. `key={itemCount}` replays the count-swap on every change by
 * remounting that span; the bar-rise plays once, tracked via a ref so it
 * never replays on later additions.
 */
export function CartBar() {
  const pathname = usePathname()
  const { itemCount, total } = useCartSummary()
  const [justRose, setJustRose] = useState(false)
  const previousCount = useRef(0)

  useEffect(() => {
    if (previousCount.current === 0 && itemCount > 0) setJustRose(true)
    previousCount.current = itemCount
  }, [itemCount])

  // Suppressed on /cart (it's the destination, not a shortcut to itself) and
  // on any /item/* route — the sheet's backdrop would cover it anyway, and
  // on the standalone item page it would otherwise overlap that page's own
  // sticky "Add to order" footer, since both anchor to the viewport bottom.
  // Also suppressed on / — the pre-menu service-type gate, not a browsing
  // surface, so there's nothing here to shortcut back to yet.
  if (pathname === '/cart' || pathname === '/' || pathname?.startsWith('/item/') || itemCount === 0) {
    return null
  }

  return (
    <Link
      href="/cart"
      aria-label={`${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your order, total ${formatSBDSpoken(total)}`}
      className={[
        'bg-structure text-on-structure safe-bottom shadow-float px-gutter print:hidden',
        'fixed inset-x-0 bottom-0 z-20 flex items-center justify-between',
        justRose ? 'animate-bar-rise' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ blockSize: '4rem' }}
    >
      <span key={itemCount} className="animate-count-swap text-body inline-block font-semibold">
        {itemCount} {itemCount === 1 ? 'item' : 'items'} <span aria-hidden="true">•</span> SBD{' '}
        {formatSBD(total)}
      </span>
      <ChevronIcon />
    </Link>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
