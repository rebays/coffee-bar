import type { Category } from '@/lib/types'

/**
 * Same line-art language as the rest of the system's inline icons (PlusIcon,
 * ChevronIcon, BackArrow) — thin stroke, no fill, currentColor — so the
 * sidebar reads as this app, not a borrowed icon set.
 */
const STROKE = {
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function CategoryIcon({ category }: { category: Category }) {
  switch (category) {
    case 'best-sellers':
      // A simple star — the one place this system draws a filled mark for
      // "highlighted", distinct from every outlined category glyph beside it.
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...STROKE}>
          <path d="M12 4.5l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.6 5-.7L12 4.5Z" />
        </svg>
      )
    case 'coffee':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...STROKE}>
          <path d="M5 9h11v5a5 5 0 0 1-5 5H9a4 4 0 0 1-4-4V9Z" />
          <path d="M16 10.5h1.25a2.25 2.25 0 0 1 0 4.5H16" />
          <path d="M8 4.5c.5 1 .5 1.5 0 2.5M12 4.5c.5 1 .5 1.5 0 2.5" />
        </svg>
      )
    case 'tea-refreshers':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...STROKE}>
          <path d="M7 6h10l-1 12.2a2 2 0 0 1-2 1.8h-4a2 2 0 0 1-2-1.8L7 6Z" />
          <path d="M9 10.5h6M9 14.5h6" />
        </svg>
      )
    case 'mains':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...STROKE}>
          <path d="M12 4.5v3M8.5 4.5v3M15.5 4.5c0 1.8-1 2-1 3.5v11" />
          <path d="M8.5 4.5v6c0 1-.6 1.6-1.7 1.9V19.5" />
        </svg>
      )
    case 'sandwich':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...STROKE}>
          <path d="M3.5 11 12 6l8.5 5" />
          <path d="M4 11h16l-1.5 3.5a2 2 0 0 1-1.8 1.2H7.3a2 2 0 0 1-1.8-1.2L4 11Z" />
          <path d="M6 14.5c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0" />
        </svg>
      )
    case 'salad':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...STROKE}>
          <path d="M4 13a8 8 0 0 1 16 0Z" />
          <path d="M4 13h16" />
          <path d="M12 13c0-3 .5-6 2-8M12 13c0-3-.5-6-2-8M8 13c-.3-2-.1-4 1-6" />
        </svg>
      )
    case 'sides':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...STROKE}>
          <path d="M5.5 11a6.5 4 0 0 1 13 0v3.5a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3V11Z" />
          <path d="M9 8.5V6M12 8V5M15 8.5V6" />
        </svg>
      )
    case 'bakery-desserts':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...STROKE}>
          <path d="M4.5 14c1.8-6 5.8-9.5 7.5-9.5s5.7 3.5 7.5 9.5c-2.2 1.2-4.9 2-7.5 2s-5.3-.8-7.5-2Z" />
          <path d="M6.5 14h11" />
        </svg>
      )
  }
}
