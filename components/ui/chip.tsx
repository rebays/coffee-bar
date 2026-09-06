'use client'

import type { ButtonHTMLAttributes } from 'react'

import { formatSBD, formatSBDSpoken } from '@/lib/money'
import type { Money } from '@/lib/money'

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string
  selected?: boolean
  /** Rendered inline as `Oat +$8.00`. Omitted when zero. */
  priceDelta?: Money
  /**
   * `toggle` for the category rail, `radio` inside a required option group —
   * the group owns `role="radiogroup"` and arrow-key movement.
   */
  selectionRole?: 'toggle' | 'radio'
}

export function Chip({
  label,
  selected = false,
  priceDelta,
  selectionRole = 'toggle',
  className = '',
  type = 'button',
  disabled,
  ...props
}: ChipProps) {
  const showDelta = priceDelta !== undefined && priceDelta !== 0

  return (
    <button
      type={type}
      disabled={disabled}
      // Selection is never colour alone: the chip fills *and* steps from 500 to
      // 600. Weight is swapped, never transitioned — animating a variable axis
      // re-rasterises every glyph each frame.
      {...(selectionRole === 'radio'
        ? { role: 'radio', 'aria-checked': selected }
        : { 'aria-pressed': selected })}
      className={[
        'tap-expand inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4',
        'text-small whitespace-nowrap',
        'transition-[background-color,color,border-color]',
        'duration-(--dur-fast) ease-(--ease-standard)',
        selected
          ? 'border-transparent bg-accent font-semibold text-on-accent'
          : 'border-hairline bg-transparent font-medium text-primary hover:bg-sunken',
        'disabled:pointer-events-none disabled:border-transparent',
        'disabled:bg-disabled disabled:text-disabled-text',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ blockSize: '2.5rem' }}
      {...props}
    >
      <span>{label}</span>
      {showDelta ? (
        <span
          className="text-spec wdth-condensed"
          aria-label={`plus ${formatSBDSpoken(priceDelta)}`}
        >
          {formatSBD(priceDelta, { signed: true })}
        </span>
      ) : null}
    </button>
  )
}
