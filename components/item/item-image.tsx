import Image from 'next/image'

import type { MenuItem } from '@/lib/types'

/**
 * Photos live only here — the menu is a list, not a photo grid. No fixture
 * sets `imageUrl` yet, so this renders the neutral placeholder until there's
 * a real asset pipeline; nothing else needs to change when one arrives.
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
          sizes="(min-width: 640px) 520px, 100vw"
          className="object-cover"
        />
      ) : null}
    </div>
  )
}
