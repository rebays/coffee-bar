'use client'

import { useEffect } from 'react'

import { showToast } from '@/lib/toast-store'

/**
 * Fires once per mount of the menu page while the shop reads as closed —
 * menu browsing stays open regardless (docs/DESIGN-SYSTEM.md §7's existing
 * "menu browsable" rule for the closed state), this is just the one-time
 * heads-up that ordering itself won't go through right now.
 */
export function ClosedNotice({ isOpen, opensAt }: { isOpen: boolean; opensAt: string }) {
  useEffect(() => {
    if (isOpen) return
    showToast(`We are currently closed. Orders open at ${opensAt}.`)
    // Fires once on mount for a given closed state — not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
