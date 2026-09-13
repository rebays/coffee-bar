'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { Modal } from '@/components/ui/modal'
import { Tag } from '@/components/ui/tag'
import { CategoryIcon } from '@/components/menu/category-icon'
import { formatSBD } from '@/lib/money'
import { showToast } from '@/lib/toast-store'
import type { CategoryRecord } from '@/lib/category-store'
import type { MenuItem } from '@/lib/types'

import { StaffMenuItemForm } from './staff-menu-item-form'

type Editing = { mode: 'create' } | { mode: 'edit'; slug: string } | null
type View = 'grid' | 'list'

/**
 * docs/CLAUDE.md decision 4 in full: staff manage the catalog here — sold-out
 * toggling, editing, adding, removing, and reordering items, plus (this
 * pass) adding, renaming and removing the categories those items sit in.
 * lib/menu-store.ts and lib/category-store.ts are the live state every
 * customer-facing read goes through, so a change here is visible on the
 * next request.
 */
export function StaffInventoryList({
  initialItems,
  initialCategories,
}: {
  initialItems: MenuItem[]
  initialCategories: CategoryRecord[]
}) {
  const [items, setItems] = useState(initialItems)
  const [categories, setCategories] = useState(initialCategories)
  const [view, setView] = useState<View>('grid')
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing>(null)

  const [creatingCategory, setCreatingCategory] = useState(false)
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const [renamingCategoryId, setRenamingCategoryId] = useState<string | null>(null)
  const [renameLabel, setRenameLabel] = useState('')
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [categoryPending, setCategoryPending] = useState(false)

  async function handleToggle(item: MenuItem) {
    setPendingSlug(item.slug)

    const response = await fetch(`/api/staff/menu/${item.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soldOut: !item.soldOut }),
    })

    if (response.ok) {
      const updated: MenuItem = await response.json()
      setItems((prev) => prev.map((existing) => (existing.slug === updated.slug ? updated : existing)))
      showToast(updated.soldOut ? `${updated.name} marked sold out` : `${updated.name} marked available`)
    } else {
      showToast('That failed — try again.', 'error')
    }
    setPendingSlug(null)
  }

  async function handleReorder(slug: string, direction: 'up' | 'down') {
    setPendingSlug(slug)

    const response = await fetch(`/api/staff/menu/${slug}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    })

    if (response.ok) {
      const data: { items: MenuItem[] } = await response.json()
      setItems(data.items)
    } else {
      showToast('That failed — try again.', 'error')
    }
    setPendingSlug(null)
  }

  async function handleDelete(slug: string) {
    setPendingSlug(slug)
    const name = items.find((item) => item.slug === slug)?.name ?? 'Item'

    const response = await fetch(`/api/staff/menu/${slug}`, { method: 'DELETE' })

    if (response.ok) {
      setItems((prev) => prev.filter((existing) => existing.slug !== slug))
      showToast(`${name} deleted`)
    } else {
      showToast('That failed — try again.', 'error')
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
    showToast(`${created.name} added`)
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
    showToast(`${updated.name} saved`)
    return null
  }

  async function handleCreateCategory() {
    const label = newCategoryLabel.trim()
    if (!label) return

    setCategoryPending(true)
    const response = await fetch('/api/staff/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    if (response.ok) {
      const created: CategoryRecord = await response.json()
      setCategories((prev) => [...prev, created])
      setNewCategoryLabel('')
      setCreatingCategory(false)
      showToast(`${created.label} category added`)
    } else {
      showToast('That failed — try again.', 'error')
    }
    setCategoryPending(false)
  }

  async function handleRenameCategory(id: string) {
    const label = renameLabel.trim()
    if (!label) return

    setCategoryPending(true)
    const response = await fetch(`/api/staff/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    if (response.ok) {
      const updated: CategoryRecord = await response.json()
      setCategories((prev) => prev.map((category) => (category.id === id ? updated : category)))
      setRenamingCategoryId(null)
      showToast(`Category renamed to ${updated.label}`)
    } else {
      showToast('That failed — try again.', 'error')
    }
    setCategoryPending(false)
  }

  async function handleDeleteCategory(id: string) {
    setCategoryPending(true)
    const label = categories.find((category) => category.id === id)?.label ?? 'Category'
    const response = await fetch(`/api/staff/categories/${id}`, { method: 'DELETE' })
    if (response.ok) {
      setCategories((prev) => prev.filter((category) => category.id !== id))
      setDeletingCategoryId(null)
      showToast(`${label} deleted`)
    } else {
      const body = await response.json().catch(() => null)
      showToast(typeof body?.error === 'string' ? body.error : 'That failed — try again.', 'error')
    }
    setCategoryPending(false)
  }

  const deletingItem = deletingSlug ? items.find((item) => item.slug === deletingSlug) : undefined
  const deletingCategory = deletingCategoryId
    ? categories.find((category) => category.id === deletingCategoryId)
    : undefined
  const editingItem = editing?.mode === 'edit' ? items.find((item) => item.slug === editing.slug) : undefined

  return (
    <div className="flex flex-col gap-6">
      <ConfirmDialog
        open={deletingSlug !== null}
        title={`Delete ${deletingItem?.name ?? 'this item'}?`}
        description="This removes it from the catalog entirely — it won't just be marked sold out."
        confirmLabel="Delete"
        pending={pendingSlug === deletingSlug}
        onConfirm={() => deletingSlug && handleDelete(deletingSlug)}
        onCancel={() => setDeletingSlug(null)}
      />

      <ConfirmDialog
        open={deletingCategoryId !== null}
        title={`Delete ${deletingCategory?.label ?? 'this category'}?`}
        description="Only possible while it has no items in it."
        confirmLabel="Delete"
        pending={categoryPending}
        onConfirm={() => deletingCategoryId && handleDeleteCategory(deletingCategoryId)}
        onCancel={() => setDeletingCategoryId(null)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" onClick={() => setEditing({ mode: 'create' })}>
            New item
          </Button>
          {creatingCategory ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newCategoryLabel}
                onChange={(event) => setNewCategoryLabel(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleCreateCategory()}
                placeholder="Category name"
                className="border-hairline rounded-input text-body border p-2"
              />
              <Button variant="secondary" size="sm" onClick={handleCreateCategory} disabled={categoryPending}>
                Add
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCreatingCategory(false)
                  setNewCategoryLabel('')
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="md" onClick={() => setCreatingCategory(true)}>
              New category
            </Button>
          )}
        </div>

        <div role="radiogroup" aria-label="Inventory view" className="border-hairline flex gap-1 rounded-full border p-1">
          <button
            type="button"
            role="radio"
            aria-checked={view === 'grid'}
            aria-label="Grid view"
            onClick={() => setView('grid')}
            className={[
              'tap-expand inline-flex items-center justify-center rounded-full',
              view === 'grid' ? 'bg-structure text-on-structure' : 'text-secondary',
            ].join(' ')}
            style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
          >
            <GridIcon />
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={view === 'list'}
            aria-label="List view"
            onClick={() => setView('list')}
            className={[
              'tap-expand inline-flex items-center justify-center rounded-full',
              view === 'list' ? 'bg-structure text-on-structure' : 'text-secondary',
            ].join(' ')}
            style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
          >
            <ListIcon />
          </button>
        </div>
      </div>

      <Modal open={editing?.mode === 'create'} onClose={() => setEditing(null)}>
        <StaffMenuItemForm categories={categories} onCancel={() => setEditing(null)} onSubmit={handleCreateSubmit} />
      </Modal>

      <Modal open={editing?.mode === 'edit'} onClose={() => setEditing(null)}>
        {editingItem ? (
          <StaffMenuItemForm
            item={editingItem}
            categories={categories}
            onCancel={() => setEditing(null)}
            onSubmit={(fields) => handleUpdateSubmit(editingItem.slug, fields)}
          />
        ) : null}
      </Modal>

      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.category === category.id)
        if (categoryItems.length === 0 && renamingCategoryId !== category.id) return null

        return (
          <div key={category.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              {renamingCategoryId === category.id ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={renameLabel}
                    onChange={(event) => setRenameLabel(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleRenameCategory(category.id)}
                    className="border-hairline rounded-input text-body border p-2"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRenameCategory(category.id)}
                    disabled={categoryPending}
                  >
                    Save
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setRenamingCategoryId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-tertiary">
                    <CategoryIcon category={category.id} />
                  </span>
                  <h2 className="text-spec wdth-condensed text-secondary">{category.label}</h2>
                </div>
              )}

              {renamingCategoryId === category.id ? null : (
                <div className="flex shrink-0 items-center gap-2">
                  <IconActionButton
                    label={`Rename ${category.label}`}
                    onClick={() => {
                      setRenamingCategoryId(category.id)
                      setRenameLabel(category.label)
                    }}
                  >
                    <PencilIcon />
                  </IconActionButton>
                  <IconActionButton
                    label={`Delete ${category.label}`}
                    variant="danger"
                    onClick={() => setDeletingCategoryId(category.id)}
                  >
                    <TrashIcon />
                  </IconActionButton>
                </div>
              )}
            </div>

            {view === 'grid' ? (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryItems.map((item, index) => (
                    <li key={item.slug} className="border-hairline bg-raised rounded-tile flex flex-col gap-3 border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-start gap-2">
                          <ItemThumbnail src={item.imageUrl} size={40} muted={item.soldOut} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="min-w-0 text-item">{item.name}</span>
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

                      <div className="mt-auto flex flex-wrap items-center gap-2">
                        <IconActionButton
                          label={item.soldOut ? `Mark ${item.name} available` : `Mark ${item.name} sold out`}
                          disabled={pendingSlug === item.slug}
                          onClick={() => handleToggle(item)}
                        >
                          {item.soldOut ? <CheckCircleIcon /> : <SlashCircleIcon />}
                        </IconActionButton>
                        <IconActionButton
                          label={`Edit ${item.name}`}
                          disabled={pendingSlug === item.slug}
                          onClick={() => setEditing({ mode: 'edit', slug: item.slug })}
                        >
                          <PencilIcon />
                        </IconActionButton>
                        <IconActionButton
                          label={`Delete ${item.name}`}
                          variant="danger"
                          disabled={pendingSlug === item.slug}
                          onClick={() => setDeletingSlug(item.slug)}
                        >
                          <TrashIcon />
                        </IconActionButton>
                      </div>
                    </li>
                ))}
              </ul>
            ) : (
              <ul className="divide-hairline divide-y">
                {categoryItems.map((item, index) => (
                    <li key={item.slug} className="flex flex-wrap items-center gap-3 py-3">
                      <ItemThumbnail src={item.imageUrl} size={40} muted={item.soldOut} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="min-w-0 truncate text-item">{item.name}</span>
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
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <IconActionButton
                          label={item.soldOut ? `Mark ${item.name} available` : `Mark ${item.name} sold out`}
                          disabled={pendingSlug === item.slug}
                          onClick={() => handleToggle(item)}
                        >
                          {item.soldOut ? <CheckCircleIcon /> : <SlashCircleIcon />}
                        </IconActionButton>
                        <IconActionButton
                          label={`Edit ${item.name}`}
                          disabled={pendingSlug === item.slug}
                          onClick={() => setEditing({ mode: 'edit', slug: item.slug })}
                        >
                          <PencilIcon />
                        </IconActionButton>
                        <IconActionButton
                          label={`Delete ${item.name}`}
                          variant="danger"
                          disabled={pendingSlug === item.slug}
                          onClick={() => setDeletingSlug(item.slug)}
                        >
                          <TrashIcon />
                        </IconActionButton>
                      </div>
                    </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Icon-only replacement for the text `Button`s that used to read "Edit",
 * "Delete", "Mark sold out", "Rename" on every row — a `title` attribute
 * gives a mouse-hover label back, and `aria-label` (always the specific
 * item/category name, not just the verb) is what actually carries the
 * meaning for assistive tech once the visible word is gone. Disabled is a
 * fill swap to `--disabled`, never an opacity drop, matching Button's own
 * disabled treatment (docs/DESIGN-SYSTEM.md §8's contrast floor).
 */
function IconActionButton({
  label,
  onClick,
  disabled,
  variant = 'neutral',
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'neutral' | 'danger'
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        'tap-expand relative inline-flex items-center justify-center rounded-full transition-colors',
        'disabled:pointer-events-none disabled:border-transparent disabled:bg-disabled disabled:text-disabled-text',
        variant === 'danger'
          ? 'bg-danger text-on-danger hover:brightness-110 active:brightness-95'
          : 'border-hairline text-secondary border hover:bg-sunken',
      ].join(' ')}
      style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
    >
      {children}
    </button>
  )
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M14.5 4.5l5 5L8.5 20.5H3.5v-5L14.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12.5 6.5l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 7l1 13a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2l1-13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function SlashCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path d="M7 7l10 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8.5 12.3l2.4 2.4 4.6-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M2 4h12M2 8h12M2 12h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
