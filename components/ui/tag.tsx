/**
 * Tags are metadata, so they are never the accent — you cannot press one.
 * Dietary and merchandising tags get the same neutral treatment as any other.
 */
export type TagVariant = 'default' | 'sold-out' | 'new' | 'live' | 'special'

const VARIANT: Record<TagVariant, string> = {
  default: 'bg-tag text-secondary',
  'sold-out': 'border border-hairline bg-transparent text-tertiary',
  new: 'bg-structure text-on-structure',
  // The accent means action or "happening right now" (§1) — the
  // staff surface's making/ready states, not a fourth palette colour.
  live: 'bg-accent-subtle text-accent',
  // The highlight colour's only job is today's special.
  special: 'bg-highlight text-on-highlight',
}

export function Tag({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode
  variant?: TagVariant
  className?: string
}) {
  return (
    <span
      className={[
        'text-spec inline-flex shrink-0 items-center rounded-full px-2',
        VARIANT[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ blockSize: '1.5rem' }}
    >
      {children}
    </span>
  )
}
