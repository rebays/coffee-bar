'use client'

import { useMemo, useState } from 'react'

import type { MenuItem } from '@/lib/types'

import { CategoryRail } from './category-rail'
import type { CategoryFilter } from './category-rail'
import { MenuList } from './menu-list'

/**
 * Owns the one piece of client state on the menu screen — which category is
 * active — so the rest of the screen (status strip, hero) stays server-only.
 */
export function MenuBody({
  items,
  orderingDisabled = false,
}: {
  items: MenuItem[]
  orderingDisabled?: boolean
}) {
  const [active, setActive] = useState<CategoryFilter>('all')

  const visible = useMemo(
    () => (active === 'all' ? items : items.filter((item) => item.category === active)),
    [items, active],
  )

  return (
    <>
      <CategoryRail active={active} onSelect={setActive} />
      <MenuList items={visible} orderingDisabled={orderingDisabled} />
    </>
  )
}
