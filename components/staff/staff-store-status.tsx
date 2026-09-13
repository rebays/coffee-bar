'use client'

import { useEffect, useState } from 'react'

import { Chip } from '@/components/ui/chip'
import type { StoreOverride } from '@/lib/shop-override-store'
import type { ShopState } from '@/lib/types'

const OVERRIDE_OPTIONS: { id: StoreOverride; label: string }[] = [
  { id: 'AUTO', label: 'Auto (schedule)' },
  { id: 'FORCE_OPEN', label: 'Force open' },
  { id: 'FORCE_CLOSED', label: 'Force closed' },
]

/**
 * Lets staff override the schedule in lib/shop-hours.ts — e.g. closing early
 * for a public holiday, or opening ahead of the usual 7am for a private
 * booking. Deliberately server-side (lib/shop-override-store.ts), not a
 * customer-facing flag: anyone can open devtools and edit localStorage, and
 * this decides whether checkout is allowed at all.
 */
export function StaffStoreStatus() {
  const [override, setOverrideState] = useState<StoreOverride | null>(null)
  const [computed, setComputed] = useState<ShopState | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    fetch('/api/staff/store-status', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { override: StoreOverride; computed: ShopState } | null) => {
        if (!data) return
        setOverrideState(data.override)
        setComputed(data.computed)
      })
  }, [])

  async function choose(next: StoreOverride) {
    setPending(true)
    const response = await fetch('/api/staff/store-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ override: next }),
    })
    if (response.ok) {
      const data: { override: StoreOverride; computed: ShopState } = await response.json()
      setOverrideState(data.override)
      setComputed(data.computed)
    }
    setPending(false)
  }

  if (override === null || computed === null) return null

  return (
    <div className="border-hairline bg-raised rounded-tile flex flex-col gap-2 border p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-item">Store hours</span>
        <span className="text-small text-secondary">
          {computed.isOpen
            ? `Open now · closes at ${computed.closesAt}`
            : `Closed · opens ${computed.opensAgainToday ? 'today' : 'tomorrow'} at ${computed.opensAt}`}
        </span>
      </div>
      <div role="radiogroup" aria-label="Store hours override" className="flex flex-wrap gap-2">
        {OVERRIDE_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            selectionRole="radio"
            selected={override === option.id}
            disabled={pending}
            onClick={() => choose(option.id)}
          />
        ))}
      </div>
    </div>
  )
}
