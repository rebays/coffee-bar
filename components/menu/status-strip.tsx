import type { ServiceType } from '@/lib/service-context'
import type { ShopState } from '@/lib/types'

/** Shared with the category sidebar so the sticky bars stack without a gap. */
export const STATUS_STRIP_HEIGHT = '2.125rem' // 34px
/** Same value in px, for JS consumers (scroll-spy rootMargin can't take rem). */
export const STATUS_STRIP_HEIGHT_PX = 34

export function StatusStrip({
  state,
  serviceType,
  tableNumber,
}: {
  state: ShopState
  serviceType?: ServiceType
  tableNumber?: string
}) {
  // No colour coding here — signal red/green is contrast-checked against a
  // white surface (docs/DESIGN-SYSTEM.md §2), not this strip's black ground,
  // and the palette has no green at all. Open/closed reads through copy
  // alone, exactly as docs/DESIGN-SYSTEM.md §7 already specifies.
  const text = state.isOpen
    ? `Open now · Closes at ${state.closesAt}`
    : `Closed · Opens ${state.opensAgainToday ? 'today' : 'tomorrow'} at ${state.opensAt}`

  // Table number only means anything for dine-in — a takeaway order carrying
  // a stale table number from an earlier session would be actively wrong.
  const serviceLabel =
    serviceType === 'dine-in' && tableNumber
      ? `Table ${tableNumber}`
      : serviceType === 'takeaway'
        ? 'Takeaway'
        : null

  return (
    <div
      className="bg-structure text-on-structure px-gutter sticky top-0 z-20 flex items-center justify-between gap-2"
      style={{ blockSize: STATUS_STRIP_HEIGHT }}
    >
      <p className="text-small">{text}</p>
      {serviceLabel ? <p className="text-small font-semibold">{serviceLabel}</p> : null}
    </div>
  )
}
