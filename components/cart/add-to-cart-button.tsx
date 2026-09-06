'use client'

import { useState } from 'react'

import { addToCart } from '@/lib/cart-store'
import { getOptionGroups } from '@/lib/fixtures'
import type { MenuItem } from '@/lib/types'

/**
 * Quick-add with every group's default choice — tapping the name opens the
 * sheet for customizing instead. This is the one orchestrated moment: a
 * guaranteed 120ms cyan fill driven by a timer, not :active, so a fast tap
 * still reads as a deliberate confirmation rather than a mouse-press blip.
 */
export function AddToCartButton({
  item,
  label,
}: {
  item: MenuItem
  label: string
}) {
  const [justAdded, setJustAdded] = useState(false)

  function handleAdd() {
    const defaults = Object.fromEntries(
      getOptionGroups(item).map((group) => [group.id, group.defaultChoiceId]),
    )
    addToCart(item.slug, defaults, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 120)
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={label}
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
