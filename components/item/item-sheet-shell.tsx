'use client'

import { createContext, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

/**
 * Lets ItemOrderForm close the sheet after adding to cart without knowing
 * whether it's rendered inside one — the standalone page never provides
 * this, so the default no-op leaves that page exactly where it was.
 */
export const ItemSheetCloseContext = createContext<() => void>(() => {})

/**
 * The bottom-sheet chrome for the intercepted route only — the standalone
 * page renders ItemContent directly with no backdrop or trap. `router.back()`
 * is the one way this closes, so browser back and the visible close controls
 * behave identically and the URL always reverts to the menu.
 */
export function ItemSheetShell({
  slug,
  children,
}: {
  slug: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)

  function close() {
    router.back()
  }

  useEffect(() => {
    const triggeredBy = document.activeElement as HTMLElement | null

    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    // Focus the first real focusable element, not the panel itself — the
    // panel's own tabIndex={-1} is deliberately excluded from
    // FOCUSABLE_SELECTOR below, so landing focus there would make the very
    // first Shift+Tab fall through to whatever the browser's native tab
    // order finds next, escaping the trap onto the page behind the backdrop.
    const initialFocusable = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    ;(initialFocusable ?? panelRef.current)?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.documentElement.style.overflow = previousOverflow
      triggeredBy?.focus?.()
    }
    // Mount/unmount only — this is a route-level shell, not a reactive component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="animate-backdrop-fade absolute inset-0 bg-black/50"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`item-heading-${slug}`}
        tabIndex={-1}
        className="animate-sheet-rise shadow-float bg-raised relative flex w-full flex-col"
        style={{
          maxInlineSize: 'var(--container-form)',
          maxBlockSize: '88vh',
          // --radius-sheet is a magnitude, not the shorthand — top corners
          // only, so the sheet still meets the screen edge at the bottom.
          borderRadius: 'var(--radius-sheet) var(--radius-sheet) 0 0',
        }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="tap-expand text-secondary hover:bg-sunken absolute end-2 top-2 z-10 inline-flex items-center justify-center rounded-full"
          style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
        >
          <CloseIcon />
        </button>
        <ItemSheetCloseContext.Provider value={close}>{children}</ItemSheetCloseContext.Provider>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M3 3l10 10M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}
