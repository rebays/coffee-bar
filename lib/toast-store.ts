'use client'

import { useSyncExternalStore } from 'react'

/**
 * A single transient message at a time — the copy convention in this app
 * ("Added to order", "Order placed") is a brief confirmation of the action
 * just taken, not a queue of notifications to work through. `variant`
 * defaults to the neutral structure-black pill everywhere already using
 * this; `'error'` is for the staff surface's failed actions, which used to
 * render as a persistent inline `<p>` instead of a toast.
 */
export type ToastVariant = 'default' | 'error'
export type ToastState = { id: number; message: string; variant: ToastVariant } | null

const DURATION_MS = 3000

let current: ToastState = null
let nextId = 0
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): ToastState {
  return current
}

function getServerSnapshot(): ToastState {
  return null
}

export function showToast(message: string, variant: ToastVariant = 'default'): void {
  const id = ++nextId
  current = { id, message, variant }
  emit()
  setTimeout(() => {
    if (current?.id === id) {
      current = null
      emit()
    }
  }, DURATION_MS)
}

export function useToast(): ToastState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
