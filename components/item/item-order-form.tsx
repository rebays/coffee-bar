'use client'

import { useContext, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Stepper } from '@/components/ui/stepper'
import { addToCart } from '@/lib/cart-store'
import { getOptionGroups } from '@/lib/fixtures'
import { addMoney, formatSBD, multiplyMoney } from '@/lib/money'
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
          <fieldset key={group.id} className="flex flex-col gap-2">
            <legend className="text-item">{group.label}</legend>
            <div role="radiogroup" aria-label={group.label} className="flex flex-wrap gap-2">
              {group.choices.map((choice) => (
                <Chip
                  key={choice.id}
                  label={choice.label}
                  priceDelta={choice.priceDelta}
                  selectionRole="radio"
                  selected={selected[group.id] === choice.id}
                  disabled={choice.soldOut}
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [group.id]: choice.id }))
                  }
                />
              ))}
            </div>
          </fieldset>
        ))}

        <div className="flex flex-col gap-2">
          <label htmlFor="item-notes" className="text-item">
            Notes
          </label>
          <textarea
            id="item-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Extra hot, no foam, on the side…"
            rows={2}
            className="border-hairline rounded-input text-body border p-3"
          />
        </div>
      </div>

      <div className="border-hairline bg-raised safe-bottom px-gutter sticky bottom-0 flex items-center gap-3 border-t py-3">
        <Stepper value={quantity} onChange={setQuantity} itemLabel={item.name} size="lg" />
        <Button size="lg" block disabled={item.soldOut} onClick={handleAdd}>
          Add to order · {formatSBD(total)}
        </Button>
      </div>
    </>
  )
}
