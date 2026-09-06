/**
 * Tags are metadata, so they are never cyan — you cannot press one. Dietary
 * tags get the same neutral treatment as any other.
 */
export type TagVariant = 'default' | 'sold-out' | 'new'

const VARIANT: Record<TagVariant, string> = {
  default: 'bg-tag text-secondary',
  // §7 specifies slate-400 here, but slate-400 is 2.8:1 on white and §8 sets a
  // hard 4.5:1 floor for text. slate-500 is the next step up and lands on the
  // floor exactly, keeping the muted read without failing it.
  'sold-out': 'border border-hairline bg-transparent text-tertiary',
  new: 'bg-structure text-on-structure',
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
        'text-spec wdth-condensed inline-flex shrink-0 items-center rounded-full px-2',
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
