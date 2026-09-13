'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

/**
 * A general-purpose popup for content too big or too free-form for
 * ConfirmDialog's fixed title/description/confirm-cancel shape — the "New
 * item" form, for one, which has a dozen fields and needs to scroll on a
 * short screen. Same backdrop/escape/animation language as ConfirmDialog,
 * but deliberately unstyled beyond centering, sizing and scroll: the forms
 * this wraps (StaffMenuItemForm) already draw their own card — border,
 * background, padding — for their other life rendered inline as an edit
 * row, so this doesn't duplicate that chrome into a card-within-a-card.
 */
export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="animate-backdrop-fade absolute inset-0 bg-black/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="animate-dialog-in relative w-full overflow-y-auto"
        style={{ maxInlineSize: '46rem', maxBlockSize: '92vh' }}
      >
        {children}
      </div>
    </div>
  )
}
