import { test } from 'node:test'
import assert from 'node:assert/strict'

import { periodStart } from './period.ts'

/**
 * Same helper shape as lib/shop-hours.test.ts's honiaraTime — builds the UTC
 * instant that reads as the given wall-clock time in Honiara.
 * 2024-01-01 was a Monday, so day-of-month doubles as a known weekday:
 * 1 Mon, 2 Tue, ... 7 Sun, 8 Mon.
 */
function honiaraTime(day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(2024, 0, day, hour - 11, minute))
}

test("'all' has no lower bound", () => {
  assert.equal(periodStart('all', honiaraTime(10, 12)), null)
})

test("'today' is midnight Honiara time on the same day", () => {
  const start = periodStart('today', honiaraTime(10, 23, 59))!
  assert.equal(start.toISOString(), honiaraTime(10, 0, 0).toISOString())
})

test("'today' just after midnight still resolves to that day's start", () => {
  const start = periodStart('today', honiaraTime(10, 0, 1))!
  assert.equal(start.toISOString(), honiaraTime(10, 0, 0).toISOString())
})

test("'week' resolves to the most recent Sunday", () => {
  // Jan 10 2024 is a Wednesday; the week starts Sunday Jan 7.
  const start = periodStart('week', honiaraTime(10, 15))!
  assert.equal(start.toISOString(), honiaraTime(7, 0, 0).toISOString())
})

test("'week' on a Sunday is that same day", () => {
  const start = periodStart('week', honiaraTime(7, 15))!
  assert.equal(start.toISOString(), honiaraTime(7, 0, 0).toISOString())
})

test("'month' resolves to the 1st of the current month", () => {
  const start = periodStart('month', honiaraTime(15, 15))!
  assert.equal(start.toISOString(), honiaraTime(1, 0, 0).toISOString())
})
