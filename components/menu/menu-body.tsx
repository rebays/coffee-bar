'use client'

import { useEffect, useRef, useState } from 'react'

import type { Category, MenuItem } from '@/lib/types'

import { CategorySidebar } from './category-sidebar'
import { MenuSection } from './menu-section'
import { STATUS_STRIP_HEIGHT_PX } from './status-strip'

/**
 * Two-column, Luckin-style menu body: a permanent left category sidebar next
 * to one continuous scroll of every category's section, in `categories`
 * order (the live taxonomy from lib/category-store.ts, passed down rather
 * than imported directly — the same pattern `items` already follows).
 * Grouping reads `item.category` directly — the same field the staff surface
 * and cart already trust — so a section can never show the wrong items.
 *
 * The sidebar's active highlight and its click-to-scroll are two directions
 * of the same state: scrolling updates `active` via IntersectionObserver,
 * clicking a category calls scrollIntoView and lets the observer catch up.
 */
export function MenuBody({
  items,
  categories,
  orderingDisabled = false,
}: {
  items: MenuItem[]
  categories: ReadonlyArray<{ id: Category; label: string }>
  orderingDisabled?: boolean
}) {
  const sectionRefs = useRef(new Map<Category, HTMLElement>())

  const groups = categories
    .map((category) => ({
      category: category.id,
      label: category.label,
      items: items.filter((item) => item.category === category.id),
    }))
    .filter((group) => group.items.length > 0)
  const sidebarCategories = groups.map((group) => ({ id: group.category, label: group.label }))

  // Falls back to categories[0] only if every category were somehow empty —
  // groups[0] is the real first non-empty one, so an empty category ahead
  // of it in taxonomy order never becomes the stuck "active" state.
  const [active, setActive] = useState<Category>(groups[0]?.category ?? categories[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const category = (entry.target as HTMLElement).dataset.category as Category
          setActive(category)
        }
      },
      // A section counts as "current" once it crosses just below the sticky
      // status strip, while it's still in the top 30% of the viewport —
      // keeps a short section from claiming "active" only while scrolled
      // deep past it.
      { rootMargin: `-${STATUS_STRIP_HEIGHT_PX}px 0px -70% 0px`, threshold: 0 },
    )

    for (const el of sectionRefs.current.values()) observer.observe(el)
    return () => observer.disconnect()
  }, [items])

  function handleSelect(category: Category) {
    const target = sectionRefs.current.get(category)
    if (!target) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="flex items-start">
      <CategorySidebar categories={sidebarCategories} active={active} onSelect={handleSelect} />
      <div className="min-w-0 flex-1">
        {groups.map((group) => (
          <MenuSection
            key={group.category}
            category={group.category}
            label={group.label}
            items={group.items}
            orderingDisabled={orderingDisabled}
            registerRef={(el) => {
              if (el) sectionRefs.current.set(group.category, el)
              else sectionRefs.current.delete(group.category)
            }}
          />
        ))}
      </div>
    </div>
  )
}
