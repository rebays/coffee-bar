import type { MenuItem } from '@/lib/types'

import { ItemImage } from './item-image'
import { ItemOrderForm } from './item-order-form'

/**
 * image → name → description → tasting note → option groups → notes → sticky
 * footer, all in one scrolling column. Used unchanged by both the modal sheet
 * and the standalone page — `flex-1 overflow-y-auto` only does anything when
 * an ancestor constrains the height (the sheet's 88vh box); on the standalone
 * page, with no such ancestor, it's inert and the browser scrolls normally.
 */
export function ItemContent({ item }: { item: MenuItem }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-gutter pt-4">
        <ItemImage item={item} />
      </div>
      <div className="px-gutter flex flex-col gap-2 py-4">
        {/* id is referenced by the sheet shell's aria-labelledby, derived
            independently from the same slug — see item-sheet-shell.tsx */}
        <h1 id={`item-heading-${item.slug}`} className="text-title">
          {item.name}
        </h1>
        <p className="text-body text-secondary">{item.description}</p>
        {item.tastingNote ? <p className="tasting-note">{item.tastingNote}</p> : null}
      </div>
      <ItemOrderForm item={item} />
    </div>
  )
}
