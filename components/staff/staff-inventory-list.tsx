'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { formatSBD } from '@/lib/money'
import { CATEGORIES } from '@/lib/types'
import type { MenuItem } from '@/lib/types'

/**
 * docs/CLAUDE.md decision 4's sold-out half: staff flip availability here,
 * lib/menu-store.ts is the live state, and every customer-facing read of
 * the menu (home, item sheet, hero) goes through that same store — so a
 * toggle here is visible on the next request, no separate sync needed.
 */
export function StaffInventoryList({ initialItems }: { initialItems: MenuItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [error, setError] = useState<string | null>(null)
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)

  async function handleToggle(item: MenuItem) {
    setPendingSlug(item.slug)
    setError(null)

    const response = await fetch(`/api/staff/menu/${item.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soldOut: !item.soldOut }),
    })

    if (response.ok) {
      const updated: MenuItem = await response.json()
      setItems((prev) => prev.map((existing) => (existing.slug === updated.slug ? updated : existing)))
    } else {
      setError('That failed — try again.')
    }
    setPendingSlug(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-danger-text text-small">{error}</p> : null}

      {CATEGORIES.map((category) => {
        const categoryItems = items.filter((item) => item.category === category.id)
        if (categoryItems.length === 0) return null

        return (
          <div key={category.id} className="flex flex-col gap-1">
            <h2 className="text-spec wdth-condensed text-secondary">{category.label}</h2>
            <ul className="divide-hairline divide-y">
              {categoryItems.map((item) => (
                <li key={item.slug} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-item truncate">{item.name}</span>
                      {item.soldOut ? <Tag variant="sold-out">Sold out</Tag> : null}
                    </div>
                    <span
                      className={[
                        'text-spec wdth-condensed text-tertiary',
                        item.soldOut ? 'line-through' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {formatSBD(item.basePrice)}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pendingSlug === item.slug}
                    onClick={() => handleToggle(item)}
                  >
                    {item.soldOut ? 'Mark available' : 'Mark sold out'}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
