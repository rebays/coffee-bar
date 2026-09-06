import Image from 'next/image'

import type { MenuItem } from '@/lib/types'

/**
 * Photos live only here — the menu is a list, not a photo grid. `imageUrl`
 * is a free-text field on the staff catalog form (lib/menu-item-input.ts),
 * not a curated asset pipeline, so there's no fixed set of domains to
 * allowlist via next.config.ts's `images.remotePatterns` — `unoptimized`
 * renders it as a plain image straight from `src` instead, which also means
 * the Next.js server never fetches an arbitrary staff-supplied URL itself.
 */
export function ItemImage({ item }: { item: MenuItem }) {
  return (
    <div
      className="bg-skeleton relative aspect-video overflow-hidden"
      style={{ borderRadius: 'var(--radius-tile)' }}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 640px) 520px, 100vw"
          className="object-cover"
        />
      ) : null}
    </div>
  )
}
