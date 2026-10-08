import { Coffee } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'

/**
 * A small square photo, for anywhere an item or order line is listed
 * inline — the menu row, cart, order tracker, receipts-that-aren't-print,
 * staff order cards. Distinct from ItemImage (the item sheet's full-width
 * aspect-video hero): this is sized for a line, not a page.
 *
 * `unoptimized` for the same reason as ItemImage — `imageUrl` is staff-
 * supplied (an upload path today, historically a free-text URL), not a
 * curated asset set, so there's no fixed domain list to hand next/image's
 * optimizer.
 */
export function ItemThumbnail({
  src,
  size = 48,
  muted = false,
  fallback,
}: {
  src?: string
  /**
   * Drawn when there's no photo, filling the frame — callers that know the
   * item's category pass its CategoryIllustration. Without one, the shop's
   * cup mark stands in, so a missing photo reads as a placeholder rather
   * than an image still loading.
   */
  fallback?: ReactNode
  /** Pixels, square. */
  size?: number
  /** Sold out / no longer on the menu — a quiet dim, paired elsewhere with a text label, never the only signal. */
  muted?: boolean
}) {
  return (
    <div
      className={[
        'rounded-tile border-hairline relative flex shrink-0 items-center justify-center overflow-hidden border',
        src ? 'bg-skeleton' : 'bg-accent-subtle text-brand',
      ].join(' ')}
      style={{ inlineSize: size, blockSize: size }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes={`${size}px`}
          className={['object-cover', muted ? 'opacity-50' : ''].filter(Boolean).join(' ')}
        />
      ) : (
        <span
          aria-hidden="true"
          className={['absolute inset-0 flex items-center justify-center', muted ? 'opacity-50' : ''].join(' ')}
        >
          {fallback ?? <Coffee size={Math.round(size * 0.42)} strokeWidth={1.75} />}
        </span>
      )}
    </div>
  )
}
