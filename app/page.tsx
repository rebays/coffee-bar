import { redirect } from 'next/navigation'

/**
 * There is no landing page — the menu is the front door. `/` stays a live
 * route only so table QR codes printed before this change (which encode
 * `/?mode=dine-in&table=…`) keep working: the query string is carried over
 * untouched, and app/menu/page.tsx + ServiceTypeSync pick it up from there
 * exactly as they would from a fresh `/menu?…` scan.
 */
export default async function HomePage(props: PageProps<'/'>) {
  const params = await props.searchParams
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      query.append(key, v)
    }
  }
  const search = query.toString()
  redirect(search ? `/menu?${search}` : '/menu')
}
