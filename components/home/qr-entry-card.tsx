'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { saveServiceContext } from '@/lib/service-context'
import type { ServiceType } from '@/lib/service-context'

/**
 * Stands in for HomeServiceCards when a QR already answered the dine-in vs.
 * takeaway question — same saveServiceContext-then-/menu flow as
 * HomeServiceCards' own `choose()`, just with the choice already made and a
 * single confirming tap instead of two cards.
 */
export function QrEntryCard({ serviceType, tableNumber }: { serviceType: ServiceType; tableNumber?: string }) {
  const router = useRouter()

  function continueToMenu() {
    saveServiceContext(serviceType, tableNumber)
    router.push('/menu')
  }

  const label =
    serviceType === 'dine-in' ? (tableNumber ? `Table ${tableNumber} · Dine-in` : 'Dine-in') : 'Takeaway'

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-body text-secondary">{label}</p>
      <Button size="lg" block onClick={continueToMenu}>
        View menu
      </Button>
    </div>
  )
}
