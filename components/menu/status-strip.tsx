import type { ShopState } from '@/lib/types'

/** Shared with CategoryRail so the two sticky bars stack without a gap. */
export const STATUS_STRIP_HEIGHT = '2.125rem' // 34px

export function StatusStrip({ state }: { state: ShopState }) {
  const text = state.isOpen
    ? `Open until ${state.closesAt} · ~${state.waitMinutes} min`
    : `Closed · opens ${state.opensAt}`

  return (
    <div
      className="bg-structure text-on-structure px-gutter sticky top-0 z-20 flex items-center"
      style={{ blockSize: STATUS_STRIP_HEIGHT }}
    >
      <p className="text-small">{text}</p>
    </div>
  )
}
