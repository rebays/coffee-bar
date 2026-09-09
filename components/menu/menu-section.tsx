import type { Category, MenuItem } from '@/lib/types'

import { MenuList } from './menu-list'
import { STATUS_STRIP_HEIGHT } from './status-strip'

/**
 * One category's heading + rows, in the continuous right-hand scroll.
 * `scrollMarginTop` matches the sticky status strip's height so a jump from
 * the sidebar lands the heading just below it, not hidden underneath.
 */
export function MenuSection({
  category,
  label,
  items,
  orderingDisabled,
  registerRef,
}: {
  category: Category
  label: string
  items: MenuItem[]
  orderingDisabled: boolean
  registerRef: (el: HTMLElement | null) => void
}) {
  return (
    <section
      ref={registerRef}
      data-category={category}
      aria-labelledby={`menu-section-${category}`}
      style={{ scrollMarginTop: STATUS_STRIP_HEIGHT }}
    >
      <h2 id={`menu-section-${category}`} className="text-section px-gutter pt-4 pb-1">
        {label}
      </h2>
      <MenuList items={items} orderingDisabled={orderingDisabled} />
    </section>
  )
}
