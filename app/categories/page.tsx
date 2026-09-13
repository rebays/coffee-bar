import Link from 'next/link'

import { CategoryGrid } from '@/components/menu/category-grid'
import type { CategorySummary } from '@/components/menu/category-grid'
import { getCategories } from '@/lib/category-store'
import { getMenuItems } from '@/lib/menu-store'

/**
 * A standalone entry point onto the menu's own taxonomy — the live category
 * list (lib/category-store.ts) mapped straight to tiles, same as MenuBody
 * maps it to sidebar buttons, and filtered the same way: a category with
 * nothing on the menu right now gets no tile, rather than a tile that lands
 * on an empty section.
 */
export default async function CategoriesPage() {
  const items = getMenuItems()

  const categories: CategorySummary[] = getCategories().map((category) => ({
    id: category.id,
    label: category.label,
    itemCount: items.filter((item) => item.category === category.id).length,
  })).filter((category) => category.itemCount > 0)

  return (
    <main
      className="mx-auto flex w-full flex-1 flex-col"
      style={{
        maxInlineSize: 'var(--container-menu)',
        // Reserves space for the floating bottom nav (64px + safe area), same
        // as app/menu/page.tsx — otherwise the last row of tiles renders
        // underneath it on a short viewport.
        paddingBlockEnd: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="px-gutter flex items-center gap-2 pt-4">
        <Link
          href="/menu"
          aria-label="Back to menu"
          className="tap-expand text-secondary inline-flex items-center justify-center rounded-full"
          style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
        >
          <BackArrow />
        </Link>
        <h1 className="text-title">Categories</h1>
      </div>

      <div className="px-gutter py-4">
        <CategoryGrid categories={categories} />
      </div>
    </main>
  )
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M10 3L5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
