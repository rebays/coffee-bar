'use client'

import { useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'

import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { OPTION_GROUPS } from '@/lib/fixtures'
import { parseSBD, formatSBD } from '@/lib/money'
import type { Category, MenuItem, RoastLevel } from '@/lib/types'

const ROAST_OPTIONS: { id: '' | RoastLevel; label: string }[] = [
  { id: '', label: 'None' },
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'dark', label: 'Dark' },
]

const inputClass = 'border-hairline rounded-input text-body border p-3'

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>
      <span className="text-item">{label}</span>
      {children}
    </label>
  )
}

type FormValues = {
  name: string
  description: string
  spec: string
  category: Category
  priceText: string
  tags: string
  optionGroupIds: string[]
  tastingNote: string
  roast: '' | RoastLevel
  imageUrl: string
  isNew: boolean
}

function toFormValues(item: MenuItem | undefined, defaultCategory: string): FormValues {
  return {
    name: item?.name ?? '',
    description: item?.description ?? '',
    spec: item?.spec ?? '',
    category: item?.category ?? defaultCategory,
    priceText: item ? formatSBD(item.basePrice, { symbol: false }) : '',
    tags: item?.tags.join(', ') ?? '',
    optionGroupIds: item?.optionGroupIds ?? [],
    tastingNote: item?.tastingNote ?? '',
    roast: item?.roast ?? '',
    imageUrl: item?.imageUrl ?? '',
    isNew: item?.isNew ?? false,
  }
}

/**
 * Shared by create and edit — the form always resubmits every editable
 * field, so there's no separate partial-patch shape to reconcile (see
 * lib/menu-item-input.ts). `soldOut` is never part of this: that stays the
 * fast, separate toggle from step 10.
 */
export function StaffMenuItemForm({
  item,
  categories,
  onCancel,
  onSubmit,
}: {
  /** Omit to render as a "new item" form. */
  item?: MenuItem
  categories: ReadonlyArray<{ id: Category; label: string }>
  onCancel: () => void
  /** Returns an error message to display, or null on success. */
  onSubmit: (fields: Record<string, unknown>) => Promise<string | null>
}) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(item, categories[0]?.id ?? ''))
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets the same file be re-picked later (e.g. after an upload error)
    if (!file) return

    setUploadError(null)
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/staff/menu/upload', { method: 'POST', body: formData })
    if (response.ok) {
      const data: { url: string } = await response.json()
      update('imageUrl', data.url)
    } else {
      const body = await response.json().catch(() => null)
      setUploadError(typeof body?.error === 'string' ? body.error : 'Upload failed — try again.')
    }
    setUploading(false)
  }

  function toggleGroup(id: string) {
    setValues((prev) => ({
      ...prev,
      optionGroupIds: prev.optionGroupIds.includes(id)
        ? prev.optionGroupIds.filter((existing) => existing !== id)
        : [...prev.optionGroupIds, id],
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    let basePrice: number
    try {
      basePrice = parseSBD(values.priceText)
    } catch {
      setError('Enter a valid price, e.g. 38.00')
      return
    }
    if (basePrice < 0) {
      setError('Price cannot be negative')
      return
    }

    setPending(true)
    const failure = await onSubmit({
      name: values.name,
      description: values.description,
      spec: values.spec,
      category: values.category,
      basePrice,
      tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      optionGroupIds: values.optionGroupIds,
      tastingNote: values.tastingNote,
      roast: values.roast,
      imageUrl: values.imageUrl,
      isNew: values.isNew,
    })
    setPending(false)
    if (failure) setError(failure)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-hairline bg-raised rounded-tile shadow-float flex flex-col gap-4 border p-4"
    >
      <h3 className="text-item">{item ? `Edit ${item.name}` : 'New item'}</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            className={inputClass}
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            required
          />
        </Field>

        <Field label="Spec">
          <input
            className={inputClass}
            value={values.spec}
            onChange={(event) => update('spec', event.target.value)}
            placeholder="2 shots · 180ml · whole milk"
            required
          />
        </Field>

        <Field label="Description" className="sm:col-span-2">
          <input
            className={inputClass}
            value={values.description}
            onChange={(event) => update('description', event.target.value)}
            required
          />
        </Field>

        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="text-item">Category</legend>
          <div role="radiogroup" aria-label="Category" className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.label}
                selectionRole="radio"
                selected={values.category === category.id}
                onClick={() => update('category', category.id)}
              />
            ))}
          </div>
        </fieldset>

        <Field label="Price (SBD)">
          <input
            className={inputClass}
            value={values.priceText}
            onChange={(event) => update('priceText', event.target.value)}
            placeholder="38.00"
            inputMode="decimal"
            required
          />
        </Field>

        <Field label="Tags">
          <input
            className={inputClass}
            value={values.tags}
            onChange={(event) => update('tags', event.target.value)}
            placeholder="Dairy free, Local"
          />
        </Field>

        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="text-item">Option groups</legend>
          <div role="group" aria-label="Option groups" className="flex flex-wrap gap-2">
            {Object.values(OPTION_GROUPS).map((group) => (
              <Chip
                key={group.id}
                label={group.label}
                selectionRole="toggle"
                selected={values.optionGroupIds.includes(group.id)}
                onClick={() => toggleGroup(group.id)}
              />
            ))}
          </div>
        </fieldset>

        <Field label="Tasting note">
          <input
            className={inputClass}
            value={values.tastingNote}
            onChange={(event) => update('tastingNote', event.target.value)}
            placeholder="Blackcurrant, brown sugar, clean finish"
          />
        </Field>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-item">Roast</legend>
          <div role="radiogroup" aria-label="Roast" className="flex flex-wrap gap-2">
            {ROAST_OPTIONS.map((option) => (
              <Chip
                key={option.id || 'none'}
                label={option.label}
                selectionRole="radio"
                selected={values.roast === option.id}
                onClick={() => update('roast', option.id)}
              />
            ))}
          </div>
        </fieldset>

        <Field label="Photo">
          <div className="flex items-center gap-3">
            <div className="border-hairline bg-skeleton rounded-tile relative h-16 w-16 shrink-0 overflow-hidden border">
              {values.imageUrl ? (
                <Image src={values.imageUrl} alt="" fill unoptimized className="object-cover" />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handlePhotoChange}
                disabled={uploading}
                className="text-small"
              />
              {uploading ? <span className="text-small text-secondary">Uploading…</span> : null}
              {uploadError ? <span className="text-danger-text text-small">{uploadError}</span> : null}
            </div>
          </div>
        </Field>

        <label className="flex items-center gap-2 text-body self-end pb-3">
          <input
            type="checkbox"
            checked={values.isNew}
            onChange={(event) => update('isNew', event.target.checked)}
          />
          Mark as new
        </label>
      </div>

      {error ? <p className="text-danger-text text-small">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" size="md" disabled={pending}>
          {pending ? 'Saving…' : item ? 'Save changes' : 'Create item'}
        </Button>
      </div>
    </form>
  )
}
