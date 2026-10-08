import {
  CakeSlice,
  Coffee,
  CupSoda,
  Popcorn,
  Salad,
  Sandwich,
  Sparkles,
  Star,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'

import type { Category } from '@/lib/types'

/**
 * One Lucide glyph per category, drawn in `currentColor` at the system's
 * line weight. Staff-added categories (lib/category-store.ts) have no
 * bespoke glyph — a tag reads as "category" without guessing at content
 * the label already names. Lucide has no fries icon, so Sides uses the
 * closest snack-in-a-box shape, Popcorn.
 */
const ICONS: Record<string, LucideIcon> = {
  __new: Sparkles, // the "New" shortcut group in components/menu/menu-body.tsx
  'best-sellers': Star,
  coffee: Coffee,
  'tea-refreshers': CupSoda,
  mains: UtensilsCrossed,
  sandwich: Sandwich,
  salad: Salad,
  sides: Popcorn,
  'bakery-desserts': CakeSlice,
}

export function CategoryIcon({ category, size = 22 }: { category: Category; size?: number }) {
  const Icon = ICONS[category] ?? Tag
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />
}
