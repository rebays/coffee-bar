import { test } from 'node:test'
import assert from 'node:assert/strict'

import { evaluateStoreSchedule } from './shop-hours.ts'

/**
 * Builds the UTC instant that reads as the given wall-clock time in Honiara
 * (a fixed UTC+11, no DST) — Date.UTC normalizes an out-of-range hour on
 * its own, so subtracting 11 rolls correctly into the previous calendar day
 * without any manual carry arithmetic here.
 *
 * 2024-01-01 was a Monday, so day-of-month doubles as a known weekday:
 * 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat, 7 Sun.
 */
function honiaraTime(day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(2024, 0, day, hour - 11, minute))
}

test('a weekday within 7:00 AM–4:30 PM reads as open', () => {
  const status = evaluateStoreSchedule(honiaraTime(3, 10, 0)) // Wednesday 10:00
  assert.equal(status.isOpen, true)
  assert.equal(status.closesAtLabel, '4:30 PM')
})

test('a weekday one minute before closing is still open; at closing it is not', () => {
  assert.equal(evaluateStoreSchedule(honiaraTime(3, 16, 29)).isOpen, true)
  assert.equal(evaluateStoreSchedule(honiaraTime(3, 16, 30)).isOpen, false)
})

test('a weekday before 7:00 AM is closed and opens later the same day', () => {
  const status = evaluateStoreSchedule(honiaraTime(3, 6, 59))
  assert.equal(status.isOpen, false)
  assert.equal(status.opensAgainToday, true)
  assert.equal(status.opensAtLabel, '7:00 AM')
})

test('a weekday after 4:30 PM is closed and opens tomorrow', () => {
  const status = evaluateStoreSchedule(honiaraTime(3, 20, 0))
  assert.equal(status.isOpen, false)
  assert.equal(status.opensAgainToday, false)
})

test('Saturday and Sunday stay open until 6:00 PM, not 4:30 PM', () => {
  const saturday = evaluateStoreSchedule(honiaraTime(6, 17, 0))
  const sunday = evaluateStoreSchedule(honiaraTime(7, 17, 0))
  assert.equal(saturday.isOpen, true)
  assert.equal(saturday.closesAtLabel, '6:00 PM')
  assert.equal(sunday.isOpen, true)
  assert.equal(sunday.closesAtLabel, '6:00 PM')
})

test('Saturday at 4:45 PM is open — a weekday at the same clock time would not be', () => {
  assert.equal(evaluateStoreSchedule(honiaraTime(6, 16, 45)).isOpen, true)
  assert.equal(evaluateStoreSchedule(honiaraTime(1, 16, 45)).isOpen, false)
})

test('exactly at opening is open; the minute before is not', () => {
  assert.equal(evaluateStoreSchedule(honiaraTime(3, 7, 0)).isOpen, true)
  assert.equal(evaluateStoreSchedule(honiaraTime(3, 6, 59)).isOpen, false)
})
