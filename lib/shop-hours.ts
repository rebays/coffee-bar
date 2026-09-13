/**
 * Pacific Coffee Bar's operating schedule, evaluated against the *server's*
 * clock in Honiara's own timezone — never the customer's device clock.
 * Whether checkout is allowed is a real business rule enforced server-side
 * (lib/actions/place-order.ts already rejects an order when the shop reads
 * as closed), so the input to that decision has to be something a customer
 * can't change by setting their phone's clock forward.
 *
 * Honiara (Pacific/Guadalcanal) is a fixed UTC+11 with no daylight saving,
 * but naming the IANA zone and letting Intl do the arithmetic is safer than
 * hand-rolling a +11 offset — it stays correct even if this ever runs on a
 * server in a different timezone.
 */
import { getWeeklyHours } from './shop-hours-store.ts'

const TIME_ZONE = 'Pacific/Guadalcanal'

export type DayHours = {
  /** Minutes after midnight. */
  opensMinute: number
  closesMinute: number
}

/** 0 = Sunday … 6 = Saturday, matching Date.prototype.getDay's numbering. */
function hoursForWeekday(weekday: number): DayHours {
  const hours = getWeeklyHours()
  return weekday === 0 || weekday === 6 ? hours.weekend : hours.weekday
}

function formatClock(minutesFromMidnight: number): string {
  const hour24 = Math.floor(minutesFromMidnight / 60)
  const minute = minutesFromMidnight % 60
  const period = hour24 < 12 ? 'AM' : 'PM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return minute === 0 ? `${hour12}:00 ${period}` : `${hour12}:${String(minute).padStart(2, '0')} ${period}`
}

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

export type StoreSchedule = {
  isOpen: boolean
  closesAtLabel: string
  opensAtLabel: string
  /** When closed: is the next opening later today, or tomorrow? */
  opensAgainToday: boolean
}

export function evaluateStoreSchedule(at: Date = new Date()): StoreSchedule {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(at)

  const weekdayName = parts.find((part) => part.type === 'weekday')!.value
  const hour = Number(parts.find((part) => part.type === 'hour')!.value)
  const minute = Number(parts.find((part) => part.type === 'minute')!.value)
  const minutesNow = hour * 60 + minute

  const hours = hoursForWeekday(WEEKDAY_INDEX[weekdayName])
  const isOpen = minutesNow >= hours.opensMinute && minutesNow < hours.closesMinute

  return {
    isOpen,
    closesAtLabel: formatClock(hours.closesMinute),
    opensAtLabel: formatClock(hours.opensMinute),
    opensAgainToday: minutesNow < hours.opensMinute,
  }
}
