import Image from 'next/image'

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
}: {
  src?: string
  /** Pixels, square. */
  size?: number
  /** Sold out / no longer on the menu — a quiet dim, paired elsewhere with a text label, never the only signal. */
  muted?: boolean
}) {
  return (
    <div
      className="bg-skeleton rounded-tile relative shrink-0 overflow-hidden"
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
      ) : null}
    </div>
  )
}
