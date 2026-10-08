'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

/** The input's id — the bottom nav's Search tab focuses it by this. */
export const MENU_SEARCH_ID = 'menu-search'

/**
 * Focuses the menu search, scrolling it into view. Exported for the bottom
 * nav, which calls it directly when the reader is already on /menu, and
 * links to `/menu#search` from anywhere else.
 */
export function focusMenuSearch() {
  const input = document.getElementById(MENU_SEARCH_ID)
  if (!(input instanceof HTMLInputElement)) return false
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  input.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
  input.focus({ preventScroll: true })
  return true
}

/**
 * A pill-shaped search field. Controlled — MenuBody owns the query, since
 * it decides what the rest of the screen shows while one is entered.
 */
export function SearchBar({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Arriving from the bottom nav's Search tab on another page.
  useEffect(() => {
    if (window.location.hash !== '#search') return
    const frame = requestAnimationFrame(() => focusMenuSearch())
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="px-gutter">
      <label
        className="surface-card focus-within:outline-(--focus-ring) flex items-center gap-3 px-5 focus-within:outline-2 focus-within:outline-offset-2"
        // Taller than a standard control: the search is the screen's main
        // way in, so it gets the most prominent field on the page.
        style={{ blockSize: '3.5rem', borderRadius: 'var(--radius-pill)' }}
      >
        <Search size={22} strokeWidth={1.75} aria-hidden="true" className="text-secondary shrink-0" />
        <span className="sr-only">Search the menu</span>
        <input
          ref={inputRef}
          id={MENU_SEARCH_ID}
          type="search"
          inputMode="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search coffee, food, dietary…"
          // The ring is drawn on the pill around it (focus-within above),
          // so the input's own outline would only double it.
          className="text-body-lg text-primary min-w-0 flex-1 bg-transparent focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('')
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="tap-expand text-tertiary hover:text-primary inline-flex shrink-0 items-center justify-center rounded-full"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        ) : null}
      </label>
    </div>
  )
}
