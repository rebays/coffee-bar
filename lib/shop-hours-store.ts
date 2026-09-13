import type { DayHours } from './shop-hours.ts'

/**
 * Staff-editable operating hours — docs/BUILD-PLAN.md shipped a fixed
 * weekday/weekend schedule; this makes both editable at runtime instead of
 * requiring a deploy to change closing time for a public holiday eve.
 * `globalThis`-anchored for the same cross-layer-module reason as
 * lib/shop-override-store.ts and every other runtime staff setting.
 */
export type WeeklyHours = {
  weekday: DayHours
  weekend: DayHours
}

const DEFAULT_HOURS: WeeklyHours = {
  weekday: { opensMinute: 7 * 60, closesMinute: 16 * 60 + 30 }, // 7:00 AM – 4:30 PM
  weekend: { opensMinute: 7 * 60, closesMinute: 18 * 60 }, // 7:00 AM – 6:00 PM
}

const globalHours = globalThis as unknown as { __coffeeBarShopHours?: WeeklyHours }

export function getWeeklyHours(): WeeklyHours {
  return globalHours.__coffeeBarShopHours ?? DEFAULT_HOURS
}

export function setWeeklyHours(hours: WeeklyHours): void {
  globalHours.__coffeeBarShopHours = hours
}

/** Every minute of the day is a valid value; only order (opens < closes) is checked here. */
export function isValidDayHours(value: unknown): value is DayHours {
  if (!value || typeof value !== 'object') return false
  const { opensMinute, closesMinute } = value as Record<string, unknown>
  return (
    Number.isInteger(opensMinute) &&
    Number.isInteger(closesMinute) &&
    (opensMinute as number) >= 0 &&
    (opensMinute as number) < 24 * 60 &&
    (closesMinute as number) > (opensMinute as number) &&
    (closesMinute as number) <= 24 * 60
  )
}

/** Test-only reset — mirrors __resetStoreOverrideForTests. */
export function __resetWeeklyHoursForTests(): void {
  globalHours.__coffeeBarShopHours = undefined
}
