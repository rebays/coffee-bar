'use client'

import { ChevronDown } from 'lucide-react'
import Image from 'next/image'

import type { Category, MenuItem } from '@/lib/types'

import { CategoryIcon } from './category-icon'
import { CategoryIllustration } from './category-illustration'
import { MenuList } from './menu-list'

/** One category and the items in it, as MenuBody derives them from the live menu. */
export interface CategoryGroup {
  category: Category
  label: string
  /** The category's own photo (lib/category-store.ts), when staff set one. */
  imageUrl?: string
  /** CSS object-position for `imageUrl` when the card crops it; centred by default. */
  imagePosition?: string
  items: MenuItem[]
}

/**
 * Full-width category tiles, stacked, each a disclosure that expands its
 * items inline. Several can be open at once. Everything is derived from the
 * groups passed in — the staff-managed category order, no tile for a
 * category with no items.
 */
export function CategoryAccordion({
  groups,
  open,
  onToggle,
  orderingDisabled,
}: {
  groups: CategoryGroup[]
  open: ReadonlySet<Category>
  onToggle: (category: Category) => void
  orderingDisabled: boolean
}) {
  return (
    <div className="px-gutter flex flex-col gap-3">
      {groups.map((group, index) => (
        <CategoryPanel
          key={group.category}
          group={group}
          // The first tiles' photos are above the fold — usually the page's
          // largest paint — so they shouldn't wait for lazy loading.
          eagerImage={index < 2}
          open={open.has(group.category)}
          onToggle={() => onToggle(group.category)}
          orderingDisabled={orderingDisabled}
        />
      ))}
    </div>
  )
}

/** Scroll margin for a `#menu-section-…` jump, so it doesn't land flush. */
const SCROLL_MARGIN = '1rem'

function CategoryPanel({
  group,
  eagerImage,
  open,
  onToggle,
  orderingDisabled,
}: {
  group: CategoryGroup
  eagerImage: boolean
  open: boolean
  onToggle: () => void
  orderingDisabled: boolean
}) {
  const headingId = `menu-section-${group.category}`
  const panelId = `menu-panel-${group.category}`

  const available = group.items.filter((item) => !item.soldOut)
  // The category's own photo, else the first item a customer could order now.
  const imageUrl = group.imageUrl ?? available[0]?.imageUrl
  // Only the category's own photo carries a chosen anchor; an item photo
  // borrowed as a fallback is centred.
  const imagePosition = group.imageUrl ? group.imagePosition : undefined

  return (
    <section data-category={group.category} className="surface-card overflow-hidden">
      {/* The disclosure pattern: a real <button> inside the <h2>, so the
          heading outline survives and aria-expanded carries the state. The
          chevron's flip and the revealed items are the visible cues. */}
      <h2 id={headingId} style={{ scrollMarginTop: SCROLL_MARGIN }}>
        {/* A large horizontal card in two parts: the words on the left, a
            photo filling the right ~42% edge to edge (the card's own rounded,
            overflow-hidden frame clips it). Until a category has a photo,
            that side carries its drawn illustration. */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="hover:bg-raised-hover flex w-full items-stretch text-start transition-colors duration-(--dur-fast) ease-(--ease-standard)"
          style={{ minBlockSize: '8.5rem' }}
        >
          <span className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
            <span
              aria-hidden="true"
              className="bg-accent-subtle text-brand flex size-10 shrink-0 items-center justify-center"
              style={{ borderRadius: 'var(--radius-control)' }}
            >
              <CategoryIcon category={group.category} size={20} />
            </span>

            <span className="flex items-end justify-between gap-2">
              <span className="text-section min-w-0">{group.label}</span>
              <ChevronDown
                size={22}
                strokeWidth={1.75}
                aria-hidden="true"
                className={[
                  'text-tertiary mb-0.5 shrink-0 transition-transform duration-300 ease-(--ease-standard)',
                  open ? 'rotate-180' : '',
                ].join(' ')}
              />
            </span>
          </span>

          <span
            aria-hidden="true"
            className={['relative shrink-0 overflow-hidden', imageUrl ? 'bg-skeleton' : ''].join(' ')}
            style={{ inlineSize: '42%' }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt=""
                fill
                unoptimized
                sizes="(min-width: 640px) 270px, 42vw"
                loading={eagerImage ? 'eager' : 'lazy'}
                className="object-cover"
                style={imagePosition ? { objectPosition: imagePosition } : undefined}
              />
            ) : (
              // "contain": the panel's aspect changes with screen width, and
              // cropping to fill it clipped the wider drawings (bakery). The
              // illustration's own backdrop fills the rest of the panel.
              <CategoryIllustration category={group.category} fit="contain" />
            )}
          </span>
        </button>
      </h2>

      {/* Height animates via a 0fr → 1fr grid row, so the panel opens to its
          real content height without measuring it. Closed panels stay
          mounted for that, so they're `inert`: out of the tab order and the
          accessibility tree, not just visually collapsed. The inner wrapper
          is `relative` so its overflow clip also catches absolutely
          positioned descendants (each Add button's sr-only live region);
          without it they escape to the page and pad its scroll height. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        inert={!open}
        className="grid transition-[grid-template-rows] duration-300 ease-(--ease-standard)"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="relative min-h-0 overflow-hidden">
          <div className="border-hairline border-t">
            <MenuList items={group.items} orderingDisabled={orderingDisabled} />
          </div>
        </div>
      </div>
    </section>
  )
}
