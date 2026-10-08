'use client'

import { useEffect, useState, type ReactNode } from 'react'

import type { Category, MenuItem } from '@/lib/types'

import { CategoryAccordion, type CategoryGroup } from './category-accordion'
import { MenuSection } from './menu-section'
import { SearchBar } from './search-bar'

/**
 * Pseudo-category for items staff flagged `isNew` — shown first, only while
 * at least one exists. The items also stay in their real category; this is
 * a shortcut, not a move. Prefixed so it can't collide with a slugified
 * staff-created category id (lib/category-store.ts never emits `__`).
 */
const NEW_GROUP_ID = '__new'

const SECTION_HASH_PREFIX = '#menu-section-'

/**
 * Search, then the category accordion.
 *
 * - **Search** matches name, description, tasting note and tags across the
 *   whole menu. While there's a query, the accordion (and whatever `intro`
 *   is — today's special) hides and the matches show grouped by category;
 *   clearing it brings everything back as it was.
 * - **Accordion** — every category starts closed, so the menu lands as a
 *   scannable list of tiles. Several can be open at once.
 * - A `/menu#menu-section-<category>` link (the /categories page) opens that
 *   category and scrolls to it, on first load and on later hash changes.
 *
 * Grouping reads `item.category` directly — the same field the staff
 * surface and cart already trust — in the live taxonomy's order, and a
 * category with no items gets no tile.
 */
export function MenuBody({
  items,
  categories,
  orderingDisabled = false,
  intro,
}: {
  items: MenuItem[]
  categories: ReadonlyArray<{ id: Category; label: string; imageUrl?: string; imagePosition?: string }>
  orderingDisabled?: boolean
  /** Shown between the search bar and the categories, hidden while searching. */
  intro?: ReactNode
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<ReadonlySet<Category>>(() => new Set())

  const newItems = items.filter((item) => item.isNew)
  const groups: CategoryGroup[] = [
    ...(newItems.length > 0 ? [{ category: NEW_GROUP_ID, label: 'New', items: newItems }] : []),
    ...categories.map((category) => ({
      category: category.id,
      label: category.label,
      imageUrl: category.imageUrl,
      imagePosition: category.imagePosition,
      items: items.filter((item) => item.category === category.id),
    })),
  ].filter((group) => group.items.length > 0)

  const trimmed = query.trim()
  const normalized = trimmed.toLowerCase()
  const searching = normalized.length > 0

  function matches(item: MenuItem) {
    return [item.name, item.description, item.tastingNote ?? '', ...item.tags].some((field) =>
      field.toLowerCase().includes(normalized),
    )
  }

  const results = searching
    ? groups
        // The New shortcut would only repeat matches already shown under
        // their real category.
        .filter((group) => group.category !== NEW_GROUP_ID)
        .map((group) => ({ ...group, items: group.items.filter(matches) }))
        .filter((group) => group.items.length > 0)
    : []

  function toggle(category: Category) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  useEffect(() => {
    function openFromHash() {
      if (!window.location.hash.startsWith(SECTION_HASH_PREFIX)) return
      const category = decodeURIComponent(window.location.hash.slice(SECTION_HASH_PREFIX.length))
      const heading = document.getElementById(`menu-section-${category}`)
      if (!heading) return
      setQuery('')
      setOpen((prev) => (prev.has(category) ? prev : new Set(prev).add(category)))
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      heading.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }

    // Deferred a frame so the first paint has laid out every tile before
    // scrolling — and so the state update happens outside the effect body.
    const frame = requestAnimationFrame(openFromHash)
    window.addEventListener('hashchange', openFromHash)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', openFromHash)
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 pb-4">
      <SearchBar value={query} onChange={setQuery} />

      {searching ? (
        <div className="flex flex-col gap-7">
          <p className="px-gutter text-small text-secondary" aria-live="polite">
            {results.length === 0
              ? `No items match “${trimmed}”. Try a shorter word, or clear the search to browse.`
              : `Results for “${trimmed}”`}
          </p>
          {results.map((group) => (
            <MenuSection
              key={group.category}
              category={group.category}
              label={group.label}
              items={group.items}
              orderingDisabled={orderingDisabled}
            />
          ))}
        </div>
      ) : (
        <>
          {intro}
          <CategoryAccordion groups={groups} open={open} onToggle={toggle} orderingDisabled={orderingDisabled} />
        </>
      )}
    </div>
  )
}
