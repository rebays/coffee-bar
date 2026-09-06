import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ItemContent } from '@/components/item/item-content'
import { getMenuItem } from '@/lib/fixtures'

/**
 * Rendered on a cold load or hard refresh — the intercepted route in
 * app/@sheet handles the in-app, soft-navigated case. Same ItemContent
 * either way; this just supplies the page chrome a bottom sheet doesn't need.
 */
export default async function ItemPage(props: PageProps<'/item/[slug]'>) {
  const { slug } = await props.params
  const item = getMenuItem(slug)
  if (!item) notFound()

  return (
    <main
      className="mx-auto flex min-h-full w-full flex-1 flex-col"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <div className="px-gutter pt-4">
        <Link href="/" className="text-small text-secondary inline-flex items-center gap-1">
          <BackArrow /> Menu
        </Link>
      </div>
      <ItemContent item={item} />
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
