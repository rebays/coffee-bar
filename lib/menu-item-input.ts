import { getCategories } from './category-store.ts'
import { OPTION_GROUPS } from './fixtures.ts'
import { isMoney } from './money.ts'
import type { Category, MenuItem, RoastLevel } from './types.ts'

/**
 * The catalog-authoring fields a staff member edits or supplies for a new
 * item. `slug` is server-generated (from `name`, on creation only) and
 * `soldOut` is deliberately excluded — that stays the fast, separate toggle
 * built for step 10, not something the edit form touches, so the two
 * features can never fight over the same field.
 */
export type MenuItemFields = Omit<MenuItem, 'slug' | 'soldOut'>

const ROAST_VALUES: readonly RoastLevel[] = ['light', 'medium', 'dark']

export type ParseResult =
  | { ok: true; fields: MenuItemFields }
  | { ok: false; error: string }

function asRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
}

function trimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Parses and validates the full editable field set from an untyped JSON
 * body — used for both creating a new item and replacing an existing one's
 * fields wholesale (the edit form always resubmits everything it shows, so
 * there's no separate partial-patch shape to reconcile against a tri-state
 * "unset vs. cleared" distinction).
 */
export function parseMenuItemFields(body: unknown): ParseResult {
  const record = asRecord(body)

  const name = trimmedString(record.name)
  if (!name) return { ok: false, error: 'name is required' }

  const description = trimmedString(record.description)
  if (!description) return { ok: false, error: 'description is required' }

  const spec = trimmedString(record.spec)
  if (!spec) return { ok: false, error: 'spec is required' }

  const categoryValues = getCategories().map((category) => category.id)
  const categoryRaw = trimmedString(record.category)
  if (!categoryValues.includes(categoryRaw)) {
    return { ok: false, error: 'category must be one of ' + categoryValues.join(', ') }
  }
  const category: Category = categoryRaw

  const basePrice = record.basePrice
  if (typeof basePrice !== 'number' || !isMoney(basePrice) || basePrice < 0) {
    return { ok: false, error: 'basePrice must be a non-negative integer number of cents' }
  }

  const tagsRaw = record.tags
  if (!Array.isArray(tagsRaw) || tagsRaw.some((tag) => typeof tag !== 'string')) {
    return { ok: false, error: 'tags must be an array of strings' }
  }
  const tags = tagsRaw.map((tag) => (tag as string).trim()).filter((tag) => tag.length > 0)

  const optionGroupIdsRaw = record.optionGroupIds
  if (!Array.isArray(optionGroupIdsRaw) || optionGroupIdsRaw.some((id) => typeof id !== 'string')) {
    return { ok: false, error: 'optionGroupIds must be an array of strings' }
  }
  const unknownGroup = optionGroupIdsRaw.find((id) => !(id in OPTION_GROUPS))
  if (unknownGroup) return { ok: false, error: `unknown option group "${unknownGroup}"` }
  const optionGroupIds = optionGroupIdsRaw as string[]

  const tastingNote = trimmedString(record.tastingNote) || undefined

  const roastRaw = trimmedString(record.roast)
  if (roastRaw && !ROAST_VALUES.includes(roastRaw as RoastLevel)) {
    return { ok: false, error: 'roast must be light, medium, dark, or omitted' }
  }
  const roast = (roastRaw as RoastLevel) || undefined

  const imageUrl = trimmedString(record.imageUrl) || undefined

  const isNew = record.isNew === true

  return {
    ok: true,
    fields: {
      name,
      description,
      spec,
      category,
      basePrice,
      tags,
      optionGroupIds,
      tastingNote,
      roast,
      imageUrl,
      isNew,
    },
  }
}
