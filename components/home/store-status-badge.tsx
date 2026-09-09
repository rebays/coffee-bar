import type { ShopState } from '@/lib/types'

/**
 * The one place in the app that reaches for green — see docs/DESIGN-SYSTEM.md
 * §2 for why this badge specifically gets to break the three-colour system
 * and the "no coloured shadows" rule. Closed reuses the existing signal/danger
 * tokens as-is; only "open" needed a colour that didn't already exist.
 */
export function StoreStatusBadge({ state }: { state: ShopState }) {
  if (state.isOpen) {
    return (
      <span
        className={[
          'bg-success-subtle border-success-subtle-border text-on-success-subtle shadow-glow-open',
          'inline-flex items-center gap-2 rounded-pill border px-4 py-1.5 text-small font-semibold',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className="bg-success inline-block shrink-0 rounded-full"
          style={{ inlineSize: '8px', blockSize: '8px' }}
        />
        {`Open now · Closes at ${state.closesAt}`}
      </span>
    )
  }

  return (
    <span className="bg-danger-subtle text-danger-text inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-small font-semibold">
      <span
        aria-hidden="true"
        className="bg-danger inline-block shrink-0 rounded-full"
        style={{ inlineSize: '8px', blockSize: '8px' }}
      />
      {`Closed · Opens ${state.opensAgainToday ? 'today' : 'tomorrow'} at ${state.opensAt}`}
    </span>
  )
}
