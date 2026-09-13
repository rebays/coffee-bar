/**
 * Period filtering for the staff History tab — "today"/"this week"/"this
 * month" mean the shop's own calendar (Honiara), not the server's locale or
 * whatever timezone the browser happens to be in. Honiara (Pacific/
 * Guadalcanal) is a fixed UTC+11 with no daylight saving (same fact
 * lib/shop-hours.ts relies on), so shifting the clock by a flat 11 hours,
 * finding the boundary in that shifted frame, then shifting back is exact —
 * no need for the heavier Intl.DateTimeFormat machinery evaluateStoreSchedule
 * uses, since that also has to *read* the current wall-clock time, not just
 * find a day/week/month boundary relative to it.
 */
const HONIARA_OFFSET_MS = 11 * 60 * 60 * 1000

export type HistoryPeriod = 'today' | 'week' | 'month' | 'all'

export const HISTORY_PERIODS: ReadonlyArray<{ id: HistoryPeriod; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'all', label: 'All time' },
]

/** The UTC instant that is midnight at the start of `period`, in Honiara's own calendar. `null` for 'all' — no lower bound. */
export function periodStart(period: HistoryPeriod, now: Date = new Date()): Date | null {
  if (period === 'all') return null

  const honiara = new Date(now.getTime() + HONIARA_OFFSET_MS)
  honiara.setUTCHours(0, 0, 0, 0)

  if (period === 'week') {
    honiara.setUTCDate(honiara.getUTCDate() - honiara.getUTCDay())
  } else if (period === 'month') {
    honiara.setUTCDate(1)
  }

  return new Date(honiara.getTime() - HONIARA_OFFSET_MS)
}

export function isHistoryPeriod(value: unknown): value is HistoryPeriod {
  return value === 'today' || value === 'week' || value === 'month' || value === 'all'
}
