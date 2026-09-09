'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { saveServiceContext } from '@/lib/service-context'
import type { ServiceType } from '@/lib/service-context'

/**
 * Persists mode/table (from a QR code's URL) into localStorage and a
 * cookie, then strips them from the address bar — the cookie is now the
 * source of truth, so reloading a bare /menu later doesn't depend on the
 * query string still being there. The menu page itself already reads these
 * same params server-side for the very first render (see app/menu/page.tsx);
 * this is only about persisting them for next time, so it renders nothing.
 */
export function ServiceTypeSync() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const mode = searchParams.get('mode')
    const table = searchParams.get('table')
    if (mode !== 'dine-in' && mode !== 'takeaway') return

    saveServiceContext(mode as ServiceType, mode === 'dine-in' ? (table ?? undefined) : undefined)
    router.replace(pathname, { scroll: false })
    // Fires once per navigation that actually carries these params, not on
    // every render — router/pathname are stable for that purpose here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return null
}
