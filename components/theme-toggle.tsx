'use client'

import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/**
 * Light/dark switch for the customer app. The theme itself is applied
 * before first paint by the inline script in app/layout.tsx; this only
 * flips `data-theme` on <html> and saves the choice. The server snapshot is
 * 'light' (what the server renders), so for a visitor who saved "dark" the
 * icon corrects itself after hydration — the page colours never flash, only
 * this one glyph.
 *
 * The icon shows the *current* mode — sun in light, moon in dark — and the
 * accessible name says what pressing it does.
 *
 * Staff and kitchen pin their own `data-theme="dark"` subtree, so this
 * never reaches them.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light' as const)
  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  function toggle() {
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
    listeners.forEach((listener) => listener())
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === 'dark' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="surface-card text-primary hover:text-brand inline-flex size-11 shrink-0 items-center justify-center transition-colors duration-(--dur-fast) ease-(--ease-standard)"
      style={{ borderRadius: 'var(--radius-pill)' }}
    >
      {theme === 'dark' ? (
        <Moon size={20} strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Sun size={20} strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  )
}

