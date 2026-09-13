'use client'

import { useToast } from '@/lib/toast-store'
import type { ToastVariant } from '@/lib/toast-store'

/**
 * Structure-black for a confirmation, danger-red for a failure — the same
 * distinction Button's `destructive` variant already draws, so an error
 * toast reads as an error at a glance rather than just another message.
 */
const VARIANT: Record<ToastVariant, string> = {
  default: 'bg-structure text-on-structure',
  error: 'bg-danger text-on-danger',
}

/**
 * One global host, mounted once in the root layout. Sits just above the
 * cart bar's 64px + safe area so the two never overlap when a toast fires
 * right after an add. z-[60], above ConfirmDialog's z-50 — a failed
 * destructive action (e.g. deleting a non-empty category) leaves the
 * dialog open for a retry, and the toast reporting that failure needs to
 * stay visible over its backdrop, not hidden behind it.
 */
export function ToastHost() {
  const toast = useToast()

  return (
    <div
      aria-live={toast?.variant === 'error' ? 'assertive' : 'polite'}
      role={toast?.variant === 'error' ? 'alert' : 'status'}
      className="px-gutter pointer-events-none fixed inset-x-0 z-[60] flex justify-center print:hidden"
      style={{ bottom: 'calc(4rem + 12px + env(safe-area-inset-bottom, 0px))' }}
    >
      {toast ? (
        <div
          key={toast.id}
          className={[
            'animate-toast-in text-small rounded-pill px-4 py-2 shadow-raise',
            VARIANT[toast.variant],
          ].join(' ')}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  )
}
