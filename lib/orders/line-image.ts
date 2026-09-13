import { getMenuItem } from '../menu-store.ts'
import type { OrderLine } from './types.ts'

/**
 * `imageUrl` is deliberately never persisted onto the stored `Order` —
 * "totals locked at placed, never recomputed from current menu prices"
 * (docs/CLAUDE.md) is about money, not photos, so a line looks up its
 * item's *current* catalog photo fresh every time a view is built rather
 * than snapshotting one at order time. A line for a since-deleted item
 * just renders with no photo (`getMenuItem` returns undefined).
 */
export type OrderLineView = OrderLine & { imageUrl?: string }

export function withLineImages(lines: OrderLine[]): OrderLineView[] {
  return lines.map((line) => {
    const imageUrl = getMenuItem(line.slug)?.imageUrl
    return imageUrl ? { ...line, imageUrl } : line
  })
}
