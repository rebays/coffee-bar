'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { formatSBD } from '@/lib/money'
import { CATEGORIES } from '@/lib/types'
import type { MenuItem } from '@/lib/types'

import { StaffMenuItemForm } from './staff-menu-item-form'

type Editing = { mode: 'create' } | { mode: 'edit'; slug: string } | null

/**
 * docs/CLAUDE.md decision 4 in full: staff manage the catalog here —
 * sold-out toggling, editing, adding, removing, and reordering — and
 * lib/menu-store.ts is the live state every customer-facing read goes
 * through, so a change here is visible on the next request.
 */
export function StaffInventoryList({ initialItems }: { initialItems: MenuItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [error, setError] = useState<string | null>(null)
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing>(null)

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

  async function handleReorder(slug: string, direction: 'up' | 'down') {
    setPendingSlug(slug)
    setError(null)

    const response = await fetch(`/api/staff/menu/${slug}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    })

    if (response.ok) {
      const data: { items: MenuItem[] } = await response.json()
      setItems(data.items)
    } else {
      setError('That failed — try again.')
    }
    setPendingSlug(null)
  }

  async function handleDelete(slug: string) {
    setPendingSlug(slug)
    setError(null)

    const response = await fetch(`/api/staff/menu/${slug}`, { method: 'DELETE' })

    if (response.ok) {
      setItems((prev) => prev.filter((existing) => existing.slug !== slug))
    } else {
      setError('That failed — try again.')
    }
    setPendingSlug(null)
    setDeletingSlug(null)
  }

  async function handleCreateSubmit(fields: Record<string, unknown>): Promise<string | null> {
    const response = await fetch('/api/staff/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      return typeof body?.error === 'string' ? body.error : 'That failed — try again.'
    }
    const created: MenuItem = await response.json()
    setItems((prev) => [...prev, created])
    setEditing(null)
    return null
  }

  async function handleUpdateSubmit(slug: string, fields: Record<string, unknown>): Promise<string | null> {
    const response = await fetch(`/api/staff/menu/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      return typeof body?.error === 'string' ? body.error : 'That failed — try again.'
    }
    const updated: MenuItem = await response.json()
    setItems((prev) => prev.map((existing) => (existing.slug === updated.slug ? updated : existing)))
    setEditing(null)
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-danger-text text-small">{error}</p> : null}

      {editing?.mode === 'create' ? (
        <StaffMenuItemForm onCancel={() => setEditing(null)} onSubmit={handleCreateSubmit} />
      ) : (
        <Button variant="secondary" size="md" onClick={() => setEditing({ mode: 'create' })}>
          New item
        </Button>
      )}

      {CATEGORIES.map((category) => {
        const categoryItems = items.filter((item) => item.category === category.id)
        if (categoryItems.length === 0) return null

        return (
          <div key={category.id} className="flex flex-col gap-1">
            <h2 className="text-spec wdth-condensed text-secondary">{category.label}</h2>
            <ul className="divide-hairline divide-y">
              {categoryItems.map((item, index) =>
                editing?.mode === 'edit' && editing.slug === item.slug ? (
                  <li key={item.slug} className="py-3">
                    <StaffMenuItemForm
                      item={item}
                      onCancel={() => setEditing(null)}
                      onSubmit={(fields) => handleUpdateSubmit(item.slug, fields)}
                    />
                  </li>
                ) : (
                  <li key={item.slug} className="flex flex-col gap-2 py-3">
                    <div className="flex items-center justify-between gap-4">
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
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Move ${item.name} up`}
                          disabled={index === 0 || pendingSlug === item.slug}
                          onClick={() => handleReorder(item.slug, 'up')}
                          className="tap-expand text-secondary disabled:text-disabled-text relative inline-flex items-center justify-center rounded-full"
                          style={{ inlineSize: '2rem', blockSize: '2rem' }}
                        >
                          <ArrowIcon direction="up" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${item.name} down`}
                          disabled={index === categoryItems.length - 1 || pendingSlug === item.slug}
                          onClick={() => handleReorder(item.slug, 'down')}
                          className="tap-expand text-secondary disabled:text-disabled-text relative inline-flex items-center justify-center rounded-full"
                          style={{ inlineSize: '2rem', blockSize: '2rem' }}
                        >
                          <ArrowIcon direction="down" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={pendingSlug === item.slug}
                        onClick={() => handleToggle(item)}
                      >
                        {item.soldOut ? 'Mark available' : 'Mark sold out'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={pendingSlug === item.slug}
                        onClick={() => setEditing({ mode: 'edit', slug: item.slug })}
                      >
                        Edit
                      </Button>
                      {deletingSlug === item.slug ? (
                        <>
                          <span className="text-danger-text text-small">Delete permanently?</span>
                          <Button variant="secondary" size="sm" onClick={() => setDeletingSlug(null)}>
                            Keep item
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={pendingSlug === item.slug}
                            onClick={() => handleDelete(item.slug)}
                          >
                            Confirm delete
                          </Button>
                        </>
                      ) : (
                        <Button variant="destructive" size="sm" onClick={() => setDeletingSlug(item.slug)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </li>
                ),
              )}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function ArrowIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d={direction === 'up' ? 'M8 12V4M4 8l4-4 4 4' : 'M8 4v8M4 8l4 4 4-4'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
