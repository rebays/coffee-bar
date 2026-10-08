import Link from 'next/link'

import { CategoryIllustration } from '@/components/menu/category-illustration'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { formatSBD, formatSBDSpoken } from '@/lib/money'
import type { MenuItem } from '@/lib/types'

/**
 * The one highlight surface in the system — staff pick the item from the
 * inventory list (lib/menu-store.ts `setTodaysSpecial`), and the menu page
 * renders nothing here when none is set or it has sold out. The whole card
 * opens the item sheet, same as tapping a menu row; adding happens there.
 *
 * Every line on the highlight uses its paired on-highlight colour.
 */
export function TodaysSpecialCard({ item }: { item: MenuItem }) {
  return (
    <section aria-labelledby="todays-special-heading" className="px-gutter">
      <Link
        href={`/item/${item.slug}`}
        className="bg-highlight text-on-highlight shadow-card group flex items-center gap-4 p-4"
        style={{ borderRadius: 'var(--radius-sheet)' }}
      >
        <ItemThumbnail src={item.imageUrl} size={88} fallback={<CategoryIllustration category={item.category} fit="contain" />} />
        <div className="min-w-0 flex-1">
          <h2 id="todays-special-heading" className="text-small flex items-center gap-1.5 font-semibold">
            <StarIcon />
            Today&apos;s special
          </h2>
          <p className="text-item font-semibold mt-1 group-hover:underline">{item.name}</p>
          <p className="text-small line-clamp-2-desc mt-0.5">{item.description}</p>
          <p className="text-price mt-1" aria-label={formatSBDSpoken(item.basePrice)}>
            {formatSBD(item.basePrice)}
          </p>
        </div>
        <ChevronRight />
      </Link>
    </section>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" className="shrink-0">
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
