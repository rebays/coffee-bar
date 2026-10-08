import type { MenuItem } from '@/lib/types'

import { MenuItemCard } from './menu-item-card'

/**
 * A hairline divides consecutive rows only — `divide-y` never draws one
 * after the last item. The gutter lives here, not on the row, so the
 * hairline still spans full row width while text stays inset from the
 * viewport edge.
 */
export function MenuList({
  items,
  orderingDisabled = false,
}: {
  items: MenuItem[]
  orderingDisabled?: boolean
}) {
  return (
    <ul className="divide-hairline px-gutter divide-y">
      {items.map((item) => (
        <MenuItemCard key={item.slug} item={item} orderingDisabled={orderingDisabled} />
      ))}
    </ul>
  )
}
