import { DISPLAY_STEPS } from '@/lib/orders/status-view'

/**
 * DESIGN-SYSTEM.md §7: "the active step fills accent with inverted text —
 * cyan's 'happening right now' job." No separate treatment is described for
 * completed steps, so past and future steps intentionally look the same;
 * only the active one is called out, by fill *and* weight together.
 */
export function OrderStatusStepper({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="flex items-start justify-between gap-2">
      {DISPLAY_STEPS.map((label, index) => {
        const isActive = index === activeIndex
        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-2 text-center">
            <span
              aria-hidden="true"
              className={[
                'text-small flex shrink-0 items-center justify-center rounded-full font-semibold',
                isActive ? 'bg-accent text-on-accent' : 'border-hairline text-tertiary border',
              ].join(' ')}
              style={{ inlineSize: '2rem', blockSize: '2rem' }}
            >
              {index + 1}
            </span>
            <span
              className={['text-small', isActive ? 'text-primary font-semibold' : 'text-tertiary'].join(
                ' ',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
