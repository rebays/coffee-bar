'use client'

import { useSyncExternalStore } from 'react'

import { addMoney } from './money.ts'
import type { Money } from './money.ts'
import { resolveCartLine } from './resolve-cart-line.ts'
import type { MenuItem } from './types.ts'

/**
 * A line is an item slug plus resolved option choices plus quantity, plus an
 * optional free-text note. Identical configurations merge into one line
 * rather than duplicating — `lineKey` is the merge key, order-independent so
 * group iteration order never splits an otherwise-identical line in two.
 * Notes are part of that key: two lines that are otherwise identical but
 * carry different notes must stay separate, or one customer's note silently
 * overwrites another's when the quantities merge.
 */
export type CartLine = {
  id: string
  slug: string
  choices: Record<string, string>
  quantity: number
  notes?: string
}

function lineKey(slug: string, choices: Record<string, string>, notes?: string): string {
  const sorted = Object.entries(choices).sort(([a], [b]) => a.localeCompare(b))
  const choicesKey = sorted.map(([groupId, choiceId]) => `${groupId}=${choiceId}`).join(',')
  return `${slug}::${choicesKey}::note=${notes ?? ''}`
}

type Listener = () => void

// A stable empty reference — useSyncExternalStore requires getServerSnapshot
// to return the same value across calls, or React treats it as changed on
// every render and loops.
const EMPTY_LINES: CartLine[] = []

let lines: CartLine[] = EMPTY_LINES
const listeners = new Set<Listener>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): CartLine[] {
  return lines
}

function getServerSnapshot(): CartLine[] {
  return EMPTY_LINES
}

/** Merges into an existing line of the same configuration and notes, or appends a new one. */
export function addToCart(
  slug: string,
  choices: Record<string, string>,
  quantity = 1,
  notes?: string,
): void {
  const trimmedNotes = notes?.trim() || undefined
  const id = lineKey(slug, choices, trimmedNotes)
  const existing = lines.find((line) => line.id === id)
  lines = existing
    ? lines.map((line) =>
        line.id === id ? { ...line, quantity: line.quantity + quantity } : line,
      )
    : [...lines, { id, slug, choices, quantity, notes: trimmedNotes }]
  emit()
}

export function setLineQuantity(id: string, quantity: number): void {
  if (quantity <= 0) {
    removeLine(id)
    return
  }
  lines = lines.map((line) => (line.id === id ? { ...line, quantity } : line))
  emit()
}

export function removeLine(id: string): void {
  lines = lines.filter((line) => line.id !== id)
  emit()
}

export function clearCart(): void {
  lines = EMPTY_LINES
  emit()
}

export function useCartLines(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Plain synchronous read for non-React callers (tests, one-off checks). */
export function getCartLines(): CartLine[] {
  return getSnapshot()
}

export type ResolvedCartLine = {
  line: CartLine
  item: MenuItem
  /** Selected choices that differ from the group's default — the cart line
      surfaces customizations, not the full configuration. */
  customizations: string[]
  unitPrice: Money
  lineTotal: Money
}

export function resolveLine(line: CartLine): ResolvedCartLine | null {
  const resolved = resolveCartLine(line.slug, line.choices, line.quantity)
  if (!resolved) return null
  return { line, ...resolved }
}

export function useCartSummary(): {
  resolved: ResolvedCartLine[]
  itemCount: number
  total: Money
} {
  const currentLines = useCartLines()
  const resolved = currentLines
    .map(resolveLine)
    .filter((line): line is ResolvedCartLine => line !== null)
  const itemCount = resolved.reduce((sum, r) => sum + r.line.quantity, 0)
  const total = addMoney(0, ...resolved.map((r) => r.lineTotal))
  return { resolved, itemCount, total }
}
