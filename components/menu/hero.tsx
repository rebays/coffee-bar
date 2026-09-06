import Link from 'next/link'

import { getMenuItem } from '@/lib/menu-store'
import type { ShopState } from '@/lib/types'

import { RoastBar } from './roast-bar'

/**
 * Live shop state, not a photo — today's filter origin, its tasting note and
 * roast. The current wait lives in the status strip above, so it isn't
 * repeated here.
 */
export function Hero({ state }: { state: ShopState }) {
  const filterItem = getMenuItem(state.filterTodaySlug)
  if (!filterItem) return null

  return (
    <Link href={`/item/${filterItem.slug}`} className="px-gutter block py-6">
      <p className="text-spec wdth-condensed text-secondary flex items-center gap-2">
        {/* Cyan marks "happening right now" — the one non-button use the
            direction allows, alongside the live order dot. */}
        <span
          aria-hidden="true"
          className="bg-accent inline-block shrink-0 rounded-full"
          style={{ inlineSize: '6px', blockSize: '6px' }}
        />
        On filter today
      </p>
      <div className="mt-1 flex items-center gap-2">
        {filterItem.roast ? <RoastBar level={filterItem.roast} /> : null}
        <h2 className="text-title">{filterItem.name}</h2>
      </div>
      {filterItem.tastingNote ? (
        <p className="tasting-note mt-1">{filterItem.tastingNote}</p>
      ) : null}
    </Link>
  )
}
