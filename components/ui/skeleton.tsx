/**
 * No shimmer. A pulsing block is motion that answers nothing, and the system
 * only animates in answer to an action.
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
 * Matches MenuItemCard (components/menu/menu-item-card.tsx) — thumbnail,
 * name, description, then the price and Add pill — so nothing shifts when
 * the real card replaces it.
 */
export function MenuItemCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-4" aria-hidden="true">
      <div className="flex gap-3">
        <Skeleton width="72px" height="72px" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton width="9rem" height="1.5rem" />
          <Skeleton width="100%" height="1.25rem" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3" style={{ paddingInlineStart: 'calc(72px + 0.75rem)' }}>
        <Skeleton width="4rem" height="1.5rem" />
        <Skeleton width="4.5rem" height="var(--tap-min)" className="rounded-full" />
      </div>
    </div>
  )
}
