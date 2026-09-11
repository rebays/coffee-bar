'use client'

import { useState } from 'react'
import Link from 'next/link'

import type { Category } from '@/lib/types'

import { CategoryIcon } from './category-icon'

export type CategorySummary = {
  id: Category
  label: string
  itemCount: number
}

/**
 * Purely declarative: `categories` is filtered by the search term and mapped
 * straight into tiles, with no imperative DOM work anywhere. Each tile links
 * to the anchor MenuSection already renders on its heading
 * (`menu-section-<category>`) — no query param or extra menu-side plumbing
 * needed to land on the right section.
 */
export function CategoryGrid({ categories }: { categories: CategorySummary[] }) {
  const [query, setQuery] = useState('')

  const normalized = query.trim().toLowerCase()
  const filtered = normalized
    ? categories.filter((category) => category.label.toLowerCase().includes(normalized))
    : categories

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="sr-only">Search categories</span>
        <input
          type="search"
          inputMode="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search categories"
          className="rounded-tile bg-sunken text-body w-full px-4 py-3"
          style={{ blockSize: 'var(--control-md)' }}
        />
      </label>

      {filtered.length === 0 ? (
        <p className="text-body text-secondary py-8 text-center">
          No categories match “{query.trim()}”.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((category) => (
            <li key={category.id}>
              <Link
                href={`/menu#menu-section-${category.id}`}
                className={[
                  'tap-expand border-hairline rounded-tile flex flex-col items-center gap-2 border p-4 text-center',
                  'transition-colors duration-(--dur-fast) ease-(--ease-standard) hover:bg-sunken',
                ].join(' ')}
                style={{ minBlockSize: 'var(--tap-min)' }}
              >
                <CategoryIcon category={category.id} />
                <span className="text-item">{category.label}</span>
                <span className="text-spec wdth-condensed text-tertiary">
                  {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
