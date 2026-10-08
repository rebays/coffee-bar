import { DISPLAY_STEPS } from '@/lib/orders/status-view'

const STEP_DETAIL: Record<(typeof DISPLAY_STEPS)[number], string> = {
  Sent: 'Your order is with the bar.',
  Making: 'Your order is being made.',
  Ready: 'Collect it at the counter.',
  Collected: 'Picked up. Enjoy.',
}

/**
 * A vertical, step-by-step tracker. Done steps show a check on the brand
 * teal and a teal line down to the next step; the active step fills the
 * accent, carries a visible "Now" label and a one-line description; steps
 * still to come are outlined. State is never colour alone — check, label
 * and weight change with it.
 */
export function OrderStatusStepper({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="flex flex-col">
      {DISPLAY_STEPS.map((label, index) => {
        const isDone = index < activeIndex
        const isActive = index === activeIndex
        const isLast = index === DISPLAY_STEPS.length - 1

        return (
          <li key={label} className="flex gap-4" aria-current={isActive ? 'step' : undefined}>
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={[
                  'text-small flex shrink-0 items-center justify-center rounded-full font-semibold',
                  isDone
                    ? 'bg-brand text-on-accent'
                    : isActive
                      ? 'bg-accent text-on-accent ring-accent-subtle ring-4'
                      : 'border-line-strong text-tertiary border-2',
                ].join(' ')}
                style={{ inlineSize: '2rem', blockSize: '2rem' }}
              >
                {isDone ? <CheckIcon /> : index + 1}
              </span>
              {isLast ? null : (
                <span
                  aria-hidden="true"
                  className={['my-1 w-0.5 flex-1 rounded-full', isDone ? 'bg-brand' : 'bg-hairline'].join(' ')}
                  style={{ minBlockSize: '1.5rem' }}
                />
              )}
            </div>
            <div className={['flex min-w-0 flex-1 flex-col gap-0.5', isLast ? '' : 'pb-5'].join(' ')}>
              <div className="flex items-center gap-2" style={{ minBlockSize: '2rem' }}>
                <span className={['text-body', isActive ? 'text-primary font-semibold' : isDone ? 'text-primary' : 'text-tertiary'].join(' ')}>
                  {label}
                  {isDone ? <span className="sr-only"> (done)</span> : null}
                </span>
                {isActive ? (
                  <span className="bg-accent-subtle text-on-accent-subtle text-spec rounded-full px-2 py-0.5 font-semibold">
                    Now
                  </span>
                ) : null}
              </div>
              {isActive ? <p className="text-small text-secondary">{STEP_DETAIL[label]}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
