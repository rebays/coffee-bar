'use client'

import { useEffect, useState } from 'react'

import { Chip } from '@/components/ui/chip'

/**
 * Presentation Demo Mode — staff-only, runtime toggle, off by default. While
 * on: "Pay with M-SELEN" appears in the cart and auto-confirms itself after
 * a few seconds (still via the real server-side reconciler, never a client
 * fake — see lib/payments/demo-mselen.ts), and a couple of customer screens
 * switch to more theatrical copy for a presentation.
 */
export function StaffDemoModeToggle() {
  const [enabled, setEnabledState] = useState<boolean | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    fetch('/api/staff/demo-mode', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { enabled: boolean } | null) => {
        if (data) setEnabledState(data.enabled)
      })
  }, [])

  async function choose(next: boolean) {
    setPending(true)
    const response = await fetch('/api/staff/demo-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: next }),
    })
    if (response.ok) {
      const data: { enabled: boolean } = await response.json()
      setEnabledState(data.enabled)
    }
    setPending(false)
  }

  if (enabled === null) return null

  return (
    <div className="border-hairline rounded-tile flex items-center justify-between gap-4 border p-4">
      <div>
        <p className="text-item">Presentation demo mode</p>
        <p className="text-small text-secondary">
          {enabled ? 'On — M-SELEN payment is simulated for demos.' : 'Off — normal phase-1 behaviour.'}
        </p>
      </div>
      <div role="radiogroup" aria-label="Presentation demo mode" className="flex gap-2">
        <Chip label="Off" selectionRole="radio" selected={!enabled} disabled={pending} onClick={() => choose(false)} />
        <Chip label="On" selectionRole="radio" selected={enabled} disabled={pending} onClick={() => choose(true)} />
      </div>
    </div>
  )
}
