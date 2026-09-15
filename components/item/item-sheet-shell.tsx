'use client'

import { createContext, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

// How far down the sheet has to be dragged before it commits to closing
// instead of springing back.
const DISMISS_THRESHOLD_PX = 120

/**
 * Lets ItemOrderForm close the sheet after adding to cart without knowing
 * whether it's rendered inside one — the standalone page never provides
 * this, so the default no-op leaves that page exactly where it was.
 */
export const ItemSheetCloseContext = createContext<() => void>(() => {})

/**
 * The bottom-sheet chrome for the intercepted route only — the standalone
 * page renders ItemContent directly with no backdrop or trap. `router.back()`
 * is the one way this closes, so browser back, the visible close button, and
 * a swipe-down all behave identically and the URL always reverts to the menu.
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
  const dragRef = useRef<{ startY: number; deltaY: number } | null>(null)

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

  // Direct DOM manipulation, not React state — a drag has to track the
  // pointer 1:1 every frame, and re-rendering on every pointermove would lag
  // behind a finger on a mid-range phone. React only owns the panel before
  // and after a drag, never during one.
  function onHandlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const panel = panelRef.current
    if (!panel) return
    dragRef.current = { startY: event.clientY, deltaY: 0 }
    panel.style.transition = 'none'
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onHandlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const panel = panelRef.current
    if (!drag || !panel) return
    // Only downward drag moves the sheet — dragging up just refuses to
    // budge rather than letting the panel creep above its resting position.
    drag.deltaY = Math.max(0, event.clientY - drag.startY)
    panel.style.transform = `translateY(${drag.deltaY}px)`
  }

  function onHandlePointerUp() {
    const drag = dragRef.current
    const panel = panelRef.current
    dragRef.current = null
    if (!drag || !panel) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (drag.deltaY > DISMISS_THRESHOLD_PX) {
      // Finish the gesture's own motion (the sheet continuing to where a
      // finger already dragged it) rather than cutting to router.back()'s
      // own exit — same rule as every other transition in the system:
      // motion answers the action that's already happening.
      if (reduceMotion) {
        close()
        return
      }
      panel.style.transition = `transform var(--dur-base) var(--ease-exit)`
      panel.style.transform = 'translateY(100%)'
      panel.addEventListener('transitionend', close, { once: true })
    } else {
      panel.style.transition = reduceMotion ? 'none' : `transform var(--dur-base) var(--ease-standard)`
      panel.style.transform = 'translateY(0)'
    }
  }

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
        {/* Absolutely positioned wrapper, separate from the button that
            carries `tap-expand` — that class sets `position: relative` on
            whatever it's applied to (for its own hit-area pseudo-element),
            which previously collided with this same button also needing
            `position: absolute`, and being a same-specificity class landing
            later in the stylesheet, `tap-expand` silently won: the close
            button was offsetting from its own static flex position instead
            of the panel, landing partly outside the sheet's left edge. */}
        <div className="absolute end-2 top-2 z-10">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="tap-expand bg-black/45 text-white backdrop-blur-sm hover:bg-black/60 inline-flex items-center justify-center rounded-full"
            style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Swipe-down-to-dismiss handle. A dedicated grab target, not the
            whole header, so a drag never fights the content's own scroll —
            the image and everything below it keep behaving exactly as
            before, and this is the one place a downward drag means "close." */}
        <div
          className="flex shrink-0 cursor-grab touch-none justify-center py-2 active:cursor-grabbing"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        >
          <span aria-hidden="true" className="bg-hairline block h-1 w-9 rounded-full" />
        </div>

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
