'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { addToCart } from '@/lib/cart-store'
import type { MenuItem } from '@/lib/types'

/**
 * An item with any option group (milk, sweetness, a side choice — anything
 * to decide) opens the item sheet to choose it, same destination as tapping
 * the row. Salads are the same even with zero option groups — the Notes
 * field (dressing on the side, no croutons, …) only lives on the sheet, and
 * for a salad that's worth reaching on the fast path, unlike a plain
 * croissant. Every other zero-group item (sides, bakery/desserts)
 * quick-adds directly: the one orchestrated moment, a guaranteed 120ms cyan
 * fill driven by a timer, not :active, so a fast tap still reads as a
 * deliberate confirmation rather than a mouse-press blip.
 */
export function AddToCartButton({
  item,
  label,
}: {
  item: MenuItem
  label: string
}) {
  const router = useRouter()
  const [justAdded, setJustAdded] = useState(false)
  const hasOptions = item.optionGroupIds.length > 0 || item.category === 'salad'

  function handleAdd() {
    if (hasOptions) {
      router.push(`/item/${item.slug}`)
      return
    }
    addToCart(item.slug, {}, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 120)
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={hasOptions ? `Customize ${item.name}` : label}
      className={[
        'tap-expand inline-flex items-center justify-center rounded-full border',
        'transition-colors duration-(--dur-fast) ease-(--ease-standard)',
        justAdded
          ? 'border-transparent bg-accent text-on-accent'
          : 'border-hairline text-accent hover:bg-sunken',
      ].join(' ')}
      style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
    >
      <PlusIcon />
    </button>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}
