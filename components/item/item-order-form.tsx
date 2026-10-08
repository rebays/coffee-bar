'use client'

import { useContext, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Stepper } from '@/components/ui/stepper'
import { addToCart } from '@/lib/cart-store'
import { getOptionGroups } from '@/lib/fixtures'
import { addMoney, formatSBD, formatSBDSpoken, multiplyMoney } from '@/lib/money'
import { showToast } from '@/lib/toast-store'
import type { MenuItem } from '@/lib/types'

import { ItemSheetCloseContext } from './item-sheet-shell'

/**
 * Option groups, notes and the sticky footer — the one interactive slice of
 * the sheet, so it's the one client boundary. The footer is a plain child of
 * the same scrolling column (not a separate container): `sticky bottom-0`
 * pins it to whichever scroll ancestor is bounded, which is the sheet's own
 * 88vh box when this renders inside one, or the browser viewport on the
 * standalone page — no branching needed between the two contexts.
 */
export function ItemOrderForm({ item }: { item: MenuItem }) {
  const closeSheet = useContext(ItemSheetCloseContext)
  const groups = useMemo(() => getOptionGroups(item), [item])

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(groups.map((group) => [group.id, group.defaultChoiceId])),
  )
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')

  const unitPrice = useMemo(() => {
    const deltas = groups.map((group) => {
      const choice = group.choices.find((c) => c.id === selected[group.id])
      return choice?.priceDelta ?? 0
    })
    return addMoney(item.basePrice, ...deltas)
  }, [groups, selected, item.basePrice])

  const total = multiplyMoney(unitPrice, quantity)

  function handleAdd() {
    addToCart(item.slug, selected, quantity, notes)
    showToast('Added to order')
    // On the standalone page this is a no-op (the default context value),
    // leaving the customer on the page they may have deep-linked to on
    // purpose; inside the sheet it closes, revealing the updated cart bar.
    closeSheet()
  }

  return (
    <>
      <div className="px-gutter flex flex-col gap-6 pb-6">
        {groups.map((group) => (
          <fieldset key={group.id} className="flex flex-col gap-2.5">
            <legend className="text-item font-semibold mb-2.5">{group.label}</legend>
            <div role="radiogroup" aria-label={group.label} className="flex flex-col gap-2.5">
              {group.choices.map((choice) => (
                <OptionRow
                  key={choice.id}
                  label={choice.label}
                  priceDelta={choice.priceDelta}
                  selected={selected[group.id] === choice.id}
                  soldOut={choice.soldOut}
                  onSelect={() =>
                    setSelected((prev) => ({ ...prev, [group.id]: choice.id }))
                  }
                />
              ))}
            </div>
          </fieldset>
        ))}

        <div className="flex items-center justify-between gap-4">
          <span className="text-item font-semibold" aria-hidden="true">
            Quantity
          </span>
          <Stepper value={quantity} onChange={setQuantity} itemLabel={item.name} size="lg" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="item-notes" className="text-item font-semibold">
            Notes for the kitchen
          </label>
          <textarea
            id="item-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Extra hot, no foam, on the side…"
            rows={2}
            className="border-line-strong bg-sunken rounded-input text-body text-primary resize-none border-[1.5px] p-3"
          />
        </div>
      </div>

      <div className="border-line-strong bg-raised safe-bottom px-gutter sticky bottom-0 flex items-center gap-3 border-t py-3">
        <Button size="lg" block disabled={item.soldOut} onClick={handleAdd}>
          Add to order · {formatSBD(total)}
        </Button>
      </div>
    </>
  )
}

/**
 * One choice in a required option group, as a full-width bordered row with a
 * radio dot. Selection is never colour alone: the dot fills, the label steps
 * to semibold, and the card's border switches to the brand teal. Sold-out
 * choices strike through and mute, and can't be picked.
 */
function OptionRow({
  label,
  priceDelta,
  selected,
  soldOut,
  onSelect,
}: {
  label: string
  priceDelta: number
  selected: boolean
  soldOut?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={soldOut}
      onClick={onSelect}
      className="surface-card flex w-full items-center gap-3.5 px-4 text-start disabled:pointer-events-none"
      style={{
        minBlockSize: 'var(--control-lg)',
        // Not an outline — that would hide the :focus-visible ring.
        borderColor: selected ? 'var(--accent-brand)' : undefined,
      }}
    >
      <span
        aria-hidden="true"
        className="border-brand flex shrink-0 items-center justify-center rounded-full border-2"
        style={{ inlineSize: '1.375rem', blockSize: '1.375rem' }}
      >
        {selected ? <span className="bg-brand block rounded-full" style={{ inlineSize: '0.75rem', blockSize: '0.75rem' }} /> : null}
      </span>
      <span
        className={[
          'text-body flex-1',
          selected ? 'font-semibold' : 'font-medium',
          soldOut ? 'text-muted line-through' : 'text-primary',
        ].join(' ')}
      >
        {label}
        {soldOut ? <span className="sr-only">, sold out</span> : null}
      </span>
      {priceDelta !== 0 ? (
        <span className="text-small text-primary" aria-label={`plus ${formatSBDSpoken(priceDelta)}`}>
          {formatSBD(priceDelta, { signed: true })}
        </span>
      ) : null}
    </button>
  )
}
