'use client'

import { Check, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { addToCart } from '@/lib/cart-store'
import type { MenuItem } from '@/lib/types'

/** How long the "Added" confirmation stays on the pill. */
const CONFIRM_MS = 1200

/**
 * The "Add +" pill on a menu item. An item with any option group (milk,
 * sweetness, a side choice — anything to decide) opens the item sheet to
 * choose it, same destination as tapping the card. Salads do too even with
 * zero option groups — the Notes field (dressing on the side, no croutons, …)
 * only lives on the sheet. Every other zero-group item (sides,
 * bakery/desserts) adds straight to the cart and the pill confirms with
 * "Added" and a check — words and icon, not colour alone.
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
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hasOptions = item.optionGroupIds.length > 0 || item.category === 'salad'

  useEffect(() => () => clearTimeout(timer.current), [])

  function handleAdd() {
    if (hasOptions) {
      router.push(`/item/${item.slug}`)
      return
    }
    addToCart(item.slug, {}, 1)
    setJustAdded(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setJustAdded(false), CONFIRM_MS)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        aria-label={hasOptions ? `Customize ${item.name}` : label}
        className={[
          'bg-accent text-on-accent hover:bg-accent-hover text-small inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 font-semibold',
          'transition-all duration-(--dur-fast) ease-(--ease-standard) active:scale-95',
        ].join(' ')}
        style={{ blockSize: 'var(--tap-min)' }}
      >
        {justAdded ? (
          <>
            <Check size={16} strokeWidth={2.25} aria-hidden="true" />
            Added
          </>
        ) : (
          <>
            Add
            <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
          </>
        )}
      </button>
      {/* Outside the button: its aria-label would otherwise swallow this. */}
      <span className="sr-only" aria-live="polite">
        {justAdded ? `${item.name} added to your order` : ''}
      </span>
    </>
  )
}
