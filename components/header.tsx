import { Coffee } from 'lucide-react'

import { CartButton } from '@/components/cart/cart-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { CountUp } from '@/components/ui/count-up'
import type { ServiceType } from '@/lib/service-context'
import type { ShopState } from '@/lib/types'

/**
 * The menu's top bar: a teal cup mark, the shop name, live status
 * (open/closed, wait, closing time, table), the theme toggle and the cart.
 * Open/closed reads through the words first; the dot only repeats it — a
 * soft teal glow while open, a flat muted dot while closed.
 */
export function Header({
  state,
  serviceType,
  tableNumber,
}: {
  state: ShopState
  serviceType?: ServiceType
  tableNumber?: string
}) {
  // Table number only means anything for dine-in — a takeaway order carrying
  // a stale table number from an earlier session would be actively wrong.
  const serviceLabel =
    serviceType === 'dine-in' && tableNumber
      ? `Table ${tableNumber}`
      : serviceType === 'takeaway'
        ? 'Takeaway'
        : null

  return (
    <header className="px-gutter flex items-start gap-3 pt-5 pb-4">
      <span
        aria-hidden="true"
        className="bg-accent-subtle text-brand mt-0.5 inline-flex size-11 shrink-0 items-center justify-center"
        style={{ borderRadius: 'var(--radius-control)' }}
      >
        <Coffee size={22} strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-section">Coffee Bar</p>
        <p className="text-small text-secondary mt-0.5 flex flex-wrap items-center gap-x-1.5">
          <span
            aria-hidden="true"
            className={['inline-block rounded-full', state.isOpen ? 'bg-brand' : 'bg-muted'].join(' ')}
            style={{
              inlineSize: '0.5rem',
              blockSize: '0.5rem',
              // The glow: a soft halo in the brand teal. Static — a dot that
              // pulsed would be idle motion the system doesn't allow.
              boxShadow: state.isOpen ? '0 0 0 3px var(--accent-subtle), 0 0 8px var(--accent-brand)' : undefined,
            }}
          />
          {state.isOpen ? (
            <>
              <span className="text-primary font-semibold">Open now</span>
              <span>
                · ~<CountUp value={state.waitMinutes} /> min wait
              </span>
              <span>· Closes {state.closesAt}</span>
            </>
          ) : (
            <>
              <span className="text-primary font-semibold">Closed</span>
              <span>
                · Opens {state.opensAgainToday ? 'today' : 'tomorrow'} at {state.opensAt}
              </span>
            </>
          )}
          {serviceLabel ? <span>· {serviceLabel}</span> : null}
        </p>
      </div>

      <ThemeToggle />
      <CartButton />
    </header>
  )
}
