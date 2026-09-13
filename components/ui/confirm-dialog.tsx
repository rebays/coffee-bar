'use client'

import { useEffect } from 'react'

import { Button } from './button'
import type { ButtonVariant } from './button'

/**
 * A modal popup for a real yes/no decision (delete this item, delete this
 * category) — the staff surface used to render these as text inline next to
 * the row it applied to ("Delete permanently? / Keep item / Confirm
 * delete"), which reads as easy to miss or fat-finger next to whatever else
 * is on the row. A centered popup with a backdrop makes the decision the
 * only thing on screen for a moment, which is what a destructive,
 * irreversible action deserves.
 *
 * Not used for the order-cancel flow, which needs a reason text field
 * alongside the confirm/cancel choice — that stays inline, since a popup
 * that also opens a keyboard isn't simpler than what it replaces.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  const confirmVariant: ButtonVariant = destructive ? 'destructive' : 'primary'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="animate-backdrop-fade absolute inset-0 bg-black/60"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="border-hairline bg-raised rounded-tile animate-dialog-in relative flex w-full flex-col gap-4 border p-6 shadow-float"
        style={{ maxInlineSize: '24rem' }}
      >
        <div>
          <p id="confirm-dialog-title" className="text-item">
            {title}
          </p>
          {description ? <p className="text-small text-secondary mt-1">{description}</p> : null}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} size="md" onClick={onConfirm} disabled={pending} autoFocus>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
