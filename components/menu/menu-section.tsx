import type { Category, MenuItem } from '@/lib/types'

import { MenuList } from './menu-list'
import { STATUS_STRIP_HEIGHT } from './status-strip'

/**
 * One category's heading + rows, in the continuous right-hand scroll.
 * `scrollMarginTop` matches the sticky status strip's height so a jump lands
 * the heading just below it, not hidden underneath — needed on *both* the
 * `<section>` (MenuBody's sidebar-click calls `scrollIntoView()` on this ref)
 * and the `<h2>` (the actual id target for a plain
 * `/menu#menu-section-<category>` link from elsewhere, e.g. /categories). A
 * browser's native anchor scroll and `scrollIntoView()` both honour only the
 * scrolled-to element's own scroll-margin, never an ancestor's, so one
 * element missing it silently breaks whichever path targets that element.
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
      <h2
        id={`menu-section-${category}`}
        className="text-section text-secondary px-gutter pt-4 pb-1"
        style={{ scrollMarginTop: STATUS_STRIP_HEIGHT }}
      >
        {label}
      </h2>
      <MenuList items={items} orderingDisabled={orderingDisabled} />
    </section>
  )
}
