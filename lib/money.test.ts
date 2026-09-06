import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  addMoney,
  applyRate,
  formatSBD,
  formatSBDSpoken,
  isMoney,
  multiplyMoney,
  parseSBD,
  subtractMoney,
} from './money.ts'

test('formatSBD renders minor units as a two-decimal amount', () => {
  assert.equal(formatSBD(0), '$0.00')
  assert.equal(formatSBD(5), '$0.05')
  assert.equal(formatSBD(50), '$0.50')
  assert.equal(formatSBD(4500), '$45.00')
  assert.equal(formatSBD(4550), '$45.50')
  assert.equal(formatSBD(4505), '$45.05')
})

test('formatSBD groups thousands and keeps the cents pad', () => {
  assert.equal(formatSBD(123_450), '$1,234.50')
  assert.equal(formatSBD(100_000_00), '$100,000.00')
})

test('formatSBD signs deltas the way option chips read them', () => {
  assert.equal(formatSBD(800, { signed: true }), '+$8.00')
  assert.equal(formatSBD(0, { signed: true }), '+$0.00')
  assert.equal(formatSBD(-800, { signed: true }), '-$8.00')
  assert.equal(formatSBD(-800), '-$8.00')
  assert.equal(formatSBD(4550, { symbol: false }), '45.50')
})

test('formatSBD refuses floats rather than silently rounding one', () => {
  assert.throws(() => formatSBD(45.5), TypeError)
  assert.throws(() => formatSBD(0.1 + 0.2), TypeError)
  assert.throws(() => formatSBD(Number.NaN), TypeError)
})

test('formatSBDSpoken reads as currency for a screen reader', () => {
  assert.equal(formatSBDSpoken(0), '0 dollars')
  assert.equal(formatSBDSpoken(100), '1 dollar')
  assert.equal(formatSBDSpoken(1), '1 cent')
  assert.equal(formatSBDSpoken(50), '50 cents')
  assert.equal(formatSBDSpoken(4550), '45 dollars 50 cents')
  assert.equal(formatSBDSpoken(-800), 'minus 8 dollars')
})

test('parseSBD reaches minor units without building a float', () => {
  assert.equal(parseSBD('45'), 4500)
  assert.equal(parseSBD('45.5'), 4550)
  assert.equal(parseSBD('45.50'), 4550)
  assert.equal(parseSBD('0.05'), 5)
  assert.equal(parseSBD('.5'), 50)
  assert.equal(parseSBD('$45.50'), 4550)
  assert.equal(parseSBD('SI$45.50'), 4550)
  assert.equal(parseSBD('1,234.50'), 123_450)
  assert.equal(parseSBD('-8.00'), -800)
})

test('parseSBD rounds a third decimal place half-up', () => {
  assert.equal(parseSBD('0.004'), 0)
  assert.equal(parseSBD('0.005'), 1)
  assert.equal(parseSBD('0.006'), 1)
  assert.equal(parseSBD('45.994'), 4599)
  assert.equal(parseSBD('45.995'), 4600)
  assert.equal(parseSBD('-0.005'), -1)
})

test('parseSBD rejects anything that is not an amount', () => {
  assert.throws(() => parseSBD(''), TypeError)
  assert.throws(() => parseSBD('free'), TypeError)
  assert.throws(() => parseSBD('4.5.0'), TypeError)
})

test('parseSBD and formatSBD round-trip', () => {
  for (const text of ['$0.00', '$0.05', '$45.50', '$1,234.50']) {
    assert.equal(formatSBD(parseSBD(text)), text)
  }
})

test('addMoney and subtractMoney stay exact where floats would not', () => {
  assert.equal(addMoney(10, 20), 30)
  assert.equal(addMoney(3800, 800, 500), 5100)
  assert.equal(addMoney(), 0)
  assert.equal(subtractMoney(4500, 800), 3700)
  assert.equal(subtractMoney(800, 4500), -3700)
})

test('multiplyMoney takes an integer quantity only', () => {
  assert.equal(multiplyMoney(4550, 3), 13_650)
  assert.equal(multiplyMoney(4550, 0), 0)
  assert.throws(() => multiplyMoney(4550, 1.5), TypeError)
  assert.throws(() => multiplyMoney(4550, -1), TypeError)
})

test('applyRate rounds half-up away from zero', () => {
  assert.equal(applyRate(10_000, 1000), 1000) // 10% of $100.00
  assert.equal(applyRate(4550, 1000), 455)
  assert.equal(applyRate(1, 5000), 1) // half a cent rounds up
  assert.equal(applyRate(3, 5000), 2) // 1.5c rounds up
  assert.equal(applyRate(-1, 5000), -1) // and away from zero downward
  assert.equal(applyRate(4550, 0), 0)
  assert.throws(() => applyRate(4550, 12.5), TypeError)
})

test('isMoney guards the boundary where prices enter', () => {
  assert.equal(isMoney(4550), true)
  assert.equal(isMoney(0), true)
  assert.equal(isMoney(-800), true)
  assert.equal(isMoney(45.5), false)
  assert.equal(isMoney(Number.NaN), false)
  assert.equal(isMoney(Number.MAX_SAFE_INTEGER + 1), false)
})
