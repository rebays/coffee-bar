import type { Category } from '@/lib/types'

import { CategoryIcon } from './category-icon'
import { STATUS_STRIP_HEIGHT } from './status-strip'

/**
 * Permanent left nav, all breakpoints — a deliberate departure from the
 * design system's horizontal category rail, per this feature's redesign.
 * Sticky under the status strip; unsticks naturally once its parent row
 * (the full menu column) scrolls past, so no separate height bookkeeping
 * is needed.
 *
 * Takes the categories to show as a prop, rather than importing the full
 * CATEGORIES list itself — MenuBody has already filtered out any category
 * with no items on the menu right now, and a nav button here for a section
 * that doesn't exist below would just be a dead tap.
 */
export function CategorySidebar({
  categories,
  active,
  onSelect,
}: {
  categories: ReadonlyArray<{ id: Category; label: string }>
  active: Category
  onSelect: (category: Category) => void
}) {
  return (
    <nav
      aria-label="Menu categories"
      className="sticky flex flex-none flex-col gap-1 self-start py-3 pl-3"
      style={{ top: STATUS_STRIP_HEIGHT, inlineSize: 'var(--spacing-category-rail)' }}
    >
      {categories.map((category) => {
        const isActive = category.id === active
        return (
          <button
            key={category.id}
            type="button"
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onSelect(category.id)}
            className={[
              'tap-expand flex flex-col items-center gap-1 rounded-tile px-1 py-2.5 text-center',
              'transition-[background-color,color] duration-(--dur-fast) ease-(--ease-standard)',
              // Inactive icons/labels sit at full ink (text-primary), not the
              // muted text-secondary step — thin 1.75px icon strokes read
              // visibly lighter than solid text at the same colour, so the
              // sidebar's resting state wants the darkest neutral available,
              // not just a value that clears the text contrast floor.
              isActive
                ? 'bg-accent-subtle text-accent font-semibold'
                : 'text-primary hover:bg-sunken',
            ].join(' ')}
          >
            <CategoryIcon category={category.id} />
            <span className="text-spec wdth-condensed leading-tight">{category.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
