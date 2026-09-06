'use client'

type StepperProps = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  /** Names the thing being counted, so the controls read as more than "plus". */
  itemLabel: string
  /** Fired instead of `onChange` when minus is pressed at `min`. */
  onRemove?: () => void
}

/**
 * Segments sit at `--control-md` rather than the 40px in the component spec.
 * The three targets are adjacent with no gap, so the hit area cannot be grown
 * past the paint the way a chip's can — the control itself has to meet the
 * 44×44 floor, and it then follows kiosk density up to 56 for free.
 */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
  itemLabel,
  onRemove,
}: StepperProps) {
  const atMin = value <= min
  const removes = atMin && onRemove !== undefined

  const segment = [
    'inline-flex items-center justify-center rounded-full text-primary',
    'transition-colors duration-(--dur-fast) ease-(--ease-standard)',
    'hover:bg-sunken disabled:pointer-events-none disabled:text-disabled-text',
  ].join(' ')

  const segmentStyle = {
    blockSize: 'var(--control-md)',
    inlineSize: 'var(--control-md)',
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-hairline"
      style={{ blockSize: 'var(--control-md)' }}
    >
      <button
        type="button"
        className={segment}
        style={segmentStyle}
        // At quantity 1 minus stops decrementing and becomes the remove
        // affordance — a different icon and a different label, not just a
        // disabled button the customer has to reason about.
        onClick={() => (removes ? onRemove() : onChange(value - 1))}
        disabled={atMin && !removes}
        aria-label={removes ? `Remove ${itemLabel}` : `One fewer ${itemLabel}`}
      >
        {removes ? <TrashIcon /> : <MinusIcon />}
      </button>

      <span
        className="text-body text-center font-semibold"
        style={{ minInlineSize: 'var(--control-md)' }}
        aria-live="polite"
        aria-label={`${value} ${itemLabel}`}
      >
        {value}
      </span>

      <button
        type="button"
        className={segment}
        style={segmentStyle}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`One more ${itemLabel}`}
      >
        <PlusIcon />
      </button>
    </div>
  )
}

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path d="M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9L12 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
