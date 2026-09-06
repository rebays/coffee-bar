'use client'

import { useToast } from '@/lib/toast-store'

/**
 * One global host, mounted once in the root layout. Sits just above the
 * cart bar's 64px + safe area so the two never overlap when a toast fires
 * right after an add.
 */
export function ToastHost() {
  const toast = useToast()

  return (
    <div
      aria-live="polite"
      role="status"
      className="px-gutter pointer-events-none fixed inset-x-0 z-40 flex justify-center"
      style={{ bottom: 'calc(4rem + 12px + env(safe-area-inset-bottom, 0px))' }}
    >
      {toast ? (
        <div
          key={toast.id}
          className="bg-structure text-on-structure animate-toast-in text-small rounded-pill px-4 py-2 shadow-raise"
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  )
}
