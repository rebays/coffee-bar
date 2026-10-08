'use client'

import { useState } from 'react'
import Link from 'next/link'

import type { Category } from '@/lib/types'

import { ItemThumbnail } from '@/components/ui/item-thumbnail'

import { CategoryIcon } from './category-icon'

export type CategorySummary = {
  id: Category
  label: string
  imageUrl?: string
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
          className="surface-card text-body text-primary w-full px-4 py-3"
          style={{ blockSize: 'var(--control-md)' }}
        />
      </label>

      {filtered.length === 0 ? (
        <p className="text-body text-secondary py-8 text-center">
          No categories match “{query.trim()}”.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((category) => (
            <li key={category.id}>
              <Link
                href={`/menu#menu-section-${category.id}`}
                className="tap-expand surface-card flex w-full items-center gap-3.5 py-3 ps-3.5 pe-3"
                style={{ minBlockSize: '5.75rem' }}
              >
                <span
                  className="bg-accent-subtle text-brand rounded-control flex shrink-0 items-center justify-center"
                  style={{ inlineSize: '2.5rem', blockSize: '2.5rem' }}
                >
                  <CategoryIcon category={category.id} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-item font-semibold">{category.label}</span>
                  <span className="text-small text-secondary">
                    {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
                  </span>
                </span>
                {category.imageUrl ? <ItemThumbnail src={category.imageUrl} size={64} /> : null}
                <ChevronRight />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true" fill="none" className="text-tertiary shrink-0">
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
