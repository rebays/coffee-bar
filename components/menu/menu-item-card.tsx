import Link from 'next/link'

import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { Tag } from '@/components/ui/tag'
import { formatSBD, formatSBDSpoken } from '@/lib/money'
import type { MenuItem } from '@/lib/types'

import { CategoryIllustration } from './category-illustration'
import { RoastBar } from './roast-bar'

/** Thumbnail edge, shared with the action row's inset so price and button
 *  line up under the text, not under the photo. */
const THUMB_PX = 72

/**
 * One menu item inside an expanded category: rounded thumbnail, name,
 * tags and a two-line description (the whole block opens the item sheet),
 * then the price and an "Add" pill. Server-rendered; only the pill is a
 * client component.
 */
export function MenuItemCard({
  item,
  orderingDisabled = false,
}: {
  item: MenuItem
  /** The shop is closed — every add control disables, not just sold-out ones. */
  orderingDisabled?: boolean
}) {
  const { slug, name, description, tastingNote, roast, spec, basePrice, isNew, soldOut, tags, imageUrl } = item
  const addDisabled = soldOut || orderingDisabled

  return (
    <li className="flex flex-col gap-3 py-4">
      <Link href={`/item/${slug}`} className="group flex min-w-0 gap-3" style={{ borderRadius: 'var(--radius-control)' }}>
        <ItemThumbnail
          src={imageUrl}
          size={THUMB_PX}
          muted={soldOut}
          fallback={<CategoryIllustration category={item.category} fit="contain" />}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {/* Roast bar and name never separate. */}
            <span className="flex min-w-0 items-baseline gap-2">
              {roast ? <RoastBar level={roast} /> : null}
              <span className="text-item decoration-brand min-w-0 underline-offset-4 group-hover:underline">{name}</span>
            </span>
            {isNew ? <Tag variant="new">New</Tag> : null}
            {/* Metadata, never a call to action — neutral, never the accent. */}
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            {soldOut ? <Tag variant="sold-out">Sold out</Tag> : null}
          </div>
          <p className={['line-clamp-2-desc mt-1', tastingNote ? 'tasting-note' : 'text-small text-secondary'].join(' ')}>
            {tastingNote ?? description}
          </p>
          {spec ? <p className="text-spec text-tertiary mt-1">{spec}</p> : null}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-3" style={{ paddingInlineStart: `calc(${THUMB_PX}px + 0.75rem)` }}>
        <span
          className={['text-price', soldOut ? 'text-muted line-through' : 'text-primary'].join(' ')}
          aria-label={formatSBDSpoken(basePrice)}
        >
          {formatSBD(basePrice)}
        </span>

        {addDisabled ? (
          <span
            className="bg-disabled text-disabled-text text-small inline-flex shrink-0 items-center rounded-full px-4 font-semibold"
            style={{ blockSize: 'var(--tap-min)' }}
          >
            {soldOut ? 'Sold out' : 'Closed'}
          </span>
        ) : (
          <AddToCartButton item={item} label={`Add ${name} to order`} />
        )}
      </div>
    </li>
  )
}
