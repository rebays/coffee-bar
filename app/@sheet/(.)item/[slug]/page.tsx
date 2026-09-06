import { notFound } from 'next/navigation'

import { ItemContent } from '@/components/item/item-content'
import { ItemSheetShell } from '@/components/item/item-sheet-shell'
import { getMenuItem } from '@/lib/menu-store'

export default async function InterceptedItemPage(props: PageProps<'/item/[slug]'>) {
  const { slug } = await props.params
  const item = getMenuItem(slug)
  if (!item) notFound()

  return (
    <ItemSheetShell slug={item.slug}>
      <ItemContent item={item} />
    </ItemSheetShell>
  )
}
