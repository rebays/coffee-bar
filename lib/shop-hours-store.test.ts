import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  __resetWeeklyHoursForTests,
  getWeeklyHours,
  isValidDayHours,
  setWeeklyHours,
} from './shop-hours-store.ts'

test.beforeEach(() => {
  __resetWeeklyHoursForTests()
})

test('defaults to 7:00 AM-4:30 PM weekday, 7:00 AM-6:00 PM weekend', () => {
  const hours = getWeeklyHours()
  assert.deepEqual(hours.weekday, { opensMinute: 420, closesMinute: 990 })
  assert.deepEqual(hours.weekend, { opensMinute: 420, closesMinute: 1080 })
})

test('setWeeklyHours persists until changed again', () => {
  setWeeklyHours({
    weekday: { opensMinute: 360, closesMinute: 1020 },
    weekend: { opensMinute: 480, closesMinute: 960 },
  })
  const hours = getWeeklyHours()
  assert.deepEqual(hours.weekday, { opensMinute: 360, closesMinute: 1020 })
  assert.deepEqual(hours.weekend, { opensMinute: 480, closesMinute: 960 })
})

test('__resetWeeklyHoursForTests puts it back to the default', () => {
  setWeeklyHours({
    weekday: { opensMinute: 0, closesMinute: 1439 },
    weekend: { opensMinute: 0, closesMinute: 1439 },
  })
  __resetWeeklyHoursForTests()
  assert.deepEqual(getWeeklyHours(), {
    weekday: { opensMinute: 420, closesMinute: 990 },
    weekend: { opensMinute: 420, closesMinute: 1080 },
  })
})

test('isValidDayHours accepts a well-formed range and rejects malformed ones', () => {
  assert.equal(isValidDayHours({ opensMinute: 420, closesMinute: 990 }), true)
  assert.equal(isValidDayHours({ opensMinute: 0, closesMinute: 1439 }), true)
  assert.equal(isValidDayHours({ opensMinute: 990, closesMinute: 420 }), false, 'closes before opens')
  assert.equal(isValidDayHours({ opensMinute: 420, closesMinute: 420 }), false, 'closes equals opens')
  assert.equal(isValidDayHours({ opensMinute: -1, closesMinute: 990 }), false, 'negative')
  assert.equal(isValidDayHours({ opensMinute: 420, closesMinute: 1500 }), false, 'past midnight')
  assert.equal(isValidDayHours({ opensMinute: 420.5, closesMinute: 990 }), false, 'non-integer')
  assert.equal(isValidDayHours(null), false)
  assert.equal(isValidDayHours({}), false)
})
