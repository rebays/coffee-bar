import Link from 'next/link'

import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import { formatSBD, formatSBDSpoken } from '@/lib/money'
import type { MenuItem } from '@/lib/types'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { Tag } from '@/components/ui/tag'

import { RoastBar } from './roast-bar'

/**
 * The highest-traffic component in the product. Server-rendered — the `[+]`
 * quick-adds with every group's default choice via the client AddToCartButton;
 * tapping the name/description area opens the sheet to customize instead.
 */
export function MenuRow({
  item,
  orderingDisabled = false,
}: {
  item: MenuItem
  /** The shop is closed — every add control disables, not just sold-out ones. */
  orderingDisabled?: boolean
}) {
  const { slug, name, description, tastingNote, roast, spec, basePrice, isNew, soldOut, tags, imageUrl } = item
  const secondaryLine = tastingNote ?? description
  const href = `/item/${slug}`
  const addDisabled = soldOut || orderingDisabled
  const addLabel = soldOut
    ? `${name}, sold out`
    : orderingDisabled
      ? `${name}, closed`
      : `Add ${name} to order`

  return (
    <li className="flex items-start gap-4 py-4">
      <Link href={href} className="group flex min-w-0 flex-1 gap-3 rounded-tile">
        <ItemThumbnail src={imageUrl} size={64} muted={soldOut} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {/* Roast bar and name never separate — only the name truncates,
                so a long origin name still reads as one line at 320px. */}
            <span className="flex min-w-0 items-baseline gap-2">
              {roast ? <RoastBar level={roast} /> : null}
              <span className="text-item truncate group-hover:underline">{name}</span>
            </span>
            {isNew ? <Tag variant="new">New</Tag> : null}
            {/* Merchandising/dietary tags — "Popular", "Gluten-Free", etc. —
                are metadata, not a call to action, so they get the same
                neutral treatment as any other tag, never a colour of their
                own (docs/DESIGN-SYSTEM.md §7). */}
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            {soldOut ? <Tag variant="sold-out">Sold out</Tag> : null}
          </div>
          <p
            className={[
              'line-clamp-2-desc mt-1',
              tastingNote ? 'tasting-note' : 'text-body text-secondary',
            ].join(' ')}
          >
            {secondaryLine}
          </p>
          <p className="text-spec wdth-condensed text-tertiary mt-1">{spec}</p>
        </div>
      </Link>

      <div className="price-rail flex flex-col items-end gap-2 pt-0.5">
        <span
          className={['text-price', soldOut ? 'text-muted line-through' : 'text-primary'].join(
            ' ',
          )}
          aria-label={formatSBDSpoken(basePrice)}
        >
          {formatSBD(basePrice)}
        </span>

        {addDisabled ? (
          <button
            type="button"
            disabled
            aria-label={addLabel}
            className="tap-expand border-hairline text-disabled-text bg-disabled inline-flex items-center justify-center rounded-full border"
            style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
          >
            <PlusIcon />
          </button>
        ) : (
          <AddToCartButton item={item} label={addLabel} />
        )}
      </div>
    </li>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}
