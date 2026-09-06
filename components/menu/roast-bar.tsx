import { ROAST_SEGMENTS } from '@/lib/types'
import type { RoastLevel } from '@/lib/types'

const TOTAL_SEGMENTS = 3

/**
 * A segment count in the current text colour, not a coloured dot — cyan is
 * reserved for action, and segments survive greyscale printing.
 */
export function RoastBar({ level }: { level: RoastLevel }) {
  const filled = ROAST_SEGMENTS[level]

  return (
    <span className="roast-bar" role="img" aria-label={`${level} roast`}>
      {Array.from({ length: TOTAL_SEGMENTS }, (_, index) => (
        <i key={index} data-on={index < filled} />
      ))}
    </span>
  )
}
