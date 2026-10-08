import type { Category, MenuItem } from '@/lib/types'

import { CategoryIcon } from './category-icon'
import { MenuList } from './menu-list'

/** Breathing room above a section when the page scrolls to it — nothing is
 *  sticky over the menu any more, so this is spacing, not clearance. */
export const MENU_STICKY_OFFSET = '1rem'

/**
 * One menu section: an icon, the category name and its item count, then its
 * rows in a single rounded card. The `<h2>` keeps the
 * `menu-section-<category>` id that /categories links to, with a little
 * `scrollMarginTop` so a jump doesn't land flush against the top edge.
 */
export function MenuSection({
  category,
  label,
  items,
  orderingDisabled,
}: {
  category: Category
  label: string
  items: MenuItem[]
  orderingDisabled: boolean
}) {
  const headingId = `menu-section-${category}`

  return (
    <section aria-labelledby={headingId} data-category={category} className="flex flex-col gap-3">
      <div className="px-gutter flex items-center gap-3">
        <span
          className="bg-accent-subtle text-brand flex shrink-0 items-center justify-center"
          style={{ inlineSize: '2.25rem', blockSize: '2.25rem', borderRadius: 'var(--radius-control)' }}
        >
          <CategoryIcon category={category} />
        </span>
        <h2 id={headingId} className="text-section min-w-0 flex-1" style={{ scrollMarginTop: MENU_STICKY_OFFSET }}>
          {label}
        </h2>
        <span className="text-small text-tertiary shrink-0">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="mx-gutter surface-card overflow-hidden">
        <MenuList items={items} orderingDisabled={orderingDisabled} />
      </div>
    </section>
  )
}
