/**
 * Money — Solomon Islands dollars, always as integer minor units (cents).
 *
 * Every amount in this app is an integer. Floats are never used for a price, a
 * delta, a subtotal or a total: `0.1 + 0.2` is famously not `0.3`, and a menu
 * that is one cent out at the till is a menu nobody trusts. Formatting to a
 * decimal string happens once, at the render boundary, through `formatSBD`.
 */

/** An amount in SBD minor units. Integer, may be negative for a delta. */
export type Money = number

const MINOR_PER_MAJOR = 100

/** Basis points, so rates stay integers too: 1000 bp = 10%. */
const BASIS_POINTS = 10_000

export function isMoney(value: number): value is Money {
  return Number.isSafeInteger(value)
}

function assertMoney(value: number, label: string): asserts value is Money {
  if (!isMoney(value)) {
    throw new TypeError(
      `${label} must be an integer number of SBD cents, received ${value}`,
    )
  }
}

/** Half-up away from zero, on integers only. */
function divideRounded(numerator: number, denominator: number): Money {
  const sign = numerator < 0 ? -1 : 1
  const magnitude = Math.abs(numerator)
  return sign * Math.floor((magnitude + Math.floor(denominator / 2)) / denominator)
}

export function addMoney(...amounts: Money[]): Money {
  let total = 0
  for (const amount of amounts) {
    assertMoney(amount, 'Amount')
    total += amount
  }
  return total
}

export function subtractMoney(a: Money, b: Money): Money {
  assertMoney(a, 'Amount')
  assertMoney(b, 'Amount')
  return a - b
}

/** Line total. Quantity is a non-negative integer count, never a fraction. */
export function multiplyMoney(amount: Money, quantity: number): Money {
  assertMoney(amount, 'Amount')
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new TypeError(`Quantity must be a non-negative integer, received ${quantity}`)
  }
  return amount * quantity
}

/**
 * Apply an integer basis-point rate — service charge, tax, a percentage
 * discount. Rounds half-up away from zero so a discount and its inverse do not
 * drift in opposite directions.
 */
export function applyRate(amount: Money, rateBasisPoints: number): Money {
  assertMoney(amount, 'Amount')
  if (!Number.isSafeInteger(rateBasisPoints)) {
    throw new TypeError(
      `Rate must be an integer number of basis points, received ${rateBasisPoints}`,
    )
  }
  return divideRounded(amount * rateBasisPoints, BASIS_POINTS)
}

/**
 * Parse a decimal string to minor units without ever building a float.
 * Accepts "45", "45.5", "SI$45.50", "1,234.50", "-8.00". More than two decimal
 * places rounds half-up.
 */
export function parseSBD(input: string): Money {
  const cleaned = input.trim().replace(/[$\s,]/g, '').replace(/^SI/i, '')
  const match = /^([+-]?)(\d*)(?:\.(\d+))?$/.exec(cleaned)
  if (!match || (match[2] === '' && match[3] === undefined)) {
    throw new TypeError(`Cannot read "${input}" as an SBD amount`)
  }

  const sign = match[1] === '-' ? -1 : 1
  const major = match[2] === '' ? 0 : Number.parseInt(match[2], 10)
  const fraction = match[3] ?? ''

  // Pad or round the fraction to exactly two digits, as integers throughout.
  const cents =
    fraction.length <= 2
      ? Number.parseInt(fraction.padEnd(2, '0') || '0', 10)
      : divideRounded(Number.parseInt(fraction.slice(0, 3), 10), 10)

  return sign * (major * MINOR_PER_MAJOR + cents)
}

export type FormatOptions = {
  /** Render "+$8.00" for a positive amount. Used by option price deltas. */
  signed?: boolean
  /** Drop the currency symbol, e.g. for an input field. */
  symbol?: boolean
}

/**
 * The single render boundary for money. Everything upstream stays an integer.
 *
 * The docs write prices as `$45.00`; in Honiara the dollar is unambiguous, so
 * the bare symbol is the default and `SI$` is not spelled out on every row.
 */
export function formatSBD(amount: Money, options: FormatOptions = {}): string {
  assertMoney(amount, 'Amount')
  const { signed = false, symbol = true } = options

  const magnitude = Math.abs(amount)
  const major = Math.floor(magnitude / MINOR_PER_MAJOR)
  const cents = magnitude % MINOR_PER_MAJOR

  const sign = amount < 0 ? '-' : signed ? '+' : ''
  const grouped = major.toLocaleString('en-AU')

  return `${sign}${symbol ? '$' : ''}${grouped}.${String(cents).padStart(2, '0')}`
}

/**
 * Spoken form for `aria-label`. A screen reader reads "$45.50" as "dollar four
 * five point five zero"; this reads as money.
 */
export function formatSBDSpoken(amount: Money): string {
  assertMoney(amount, 'Amount')

  const magnitude = Math.abs(amount)
  const major = Math.floor(magnitude / MINOR_PER_MAJOR)
  const cents = magnitude % MINOR_PER_MAJOR

  const parts: string[] = []
  if (major !== 0 || cents === 0) parts.push(`${major} ${major === 1 ? 'dollar' : 'dollars'}`)
  if (cents !== 0) parts.push(`${cents} ${cents === 1 ? 'cent' : 'cents'}`)

  return `${amount < 0 ? 'minus ' : ''}${parts.join(' ')}`
}
