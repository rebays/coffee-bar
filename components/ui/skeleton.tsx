/**
 * No shimmer. A pulsing block is motion that answers nothing, and the system
 * spends its one animated moment on add-to-cart.
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  className = '',
}: {
  width?: string
  height?: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={['bg-skeleton rounded-tile block', className].filter(Boolean).join(' ')}
      style={{ inlineSize: width, blockSize: height }}
    />
  )
}

/**
 * Matches the menu row exactly — name, description, spec line and price rail —
 * so nothing shifts when the real row replaces it.
 */
export function MenuRowSkeleton() {
  return (
    <div className="hairline-b flex items-start gap-4 py-4" aria-hidden="true">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton width="9rem" height="1.625rem" />
        <Skeleton width="100%" height="1.5rem" />
        <Skeleton width="7rem" height="1rem" />
      </div>
      <Skeleton width="var(--spacing-rail)" height="1.5rem" />
      <Skeleton width="2.25rem" height="2.25rem" className="rounded-full" />
    </div>
  )
}
