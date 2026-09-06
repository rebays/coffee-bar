'use client'

import { Chip } from '@/components/ui/chip'
import { CATEGORIES } from '@/lib/types'
import type { Category } from '@/lib/types'

import { STATUS_STRIP_HEIGHT } from './status-strip'

export type CategoryFilter = 'all' | Category

export function CategoryRail({
  active,
  onSelect,
}: {
  active: CategoryFilter
  onSelect: (next: CategoryFilter) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Category"
      className="rail-scroll bg-ground px-gutter sticky z-10 flex gap-2 py-3"
      style={{ top: STATUS_STRIP_HEIGHT }}
    >
      <Chip
        label="All"
        selectionRole="radio"
        selected={active === 'all'}
        onClick={() => onSelect('all')}
      />
      {CATEGORIES.map((category) => (
        <Chip
          key={category.id}
          label={category.label}
          selectionRole="radio"
          selected={active === category.id}
          onClick={() => onSelect(category.id)}
        />
      ))}
    </div>
  )
}
