/**
 * docs/PAYMENTS.md §4: 4 characters, excluding glyphs that get misheard or
 * mistyped across a counter — "0 O 1 I L S 5". Removing those 7 characters
 * from the standard 36-character alphanumeric set (10 digits + 26 letters)
 * leaves 29, not the 24 the doc's prose claims; this follows the literal
 * excluded-character list rather than the headline count, since the list is
 * the actionable spec and the count is a side note that doesn't add up.
 */
export const PICKUP_CODE_ALPHABET = 'ABCDEFGHJKMNPQRTUVWXYZ2346789'
export const PICKUP_CODE_LENGTH = 4

function randomCode(): string {
  let code = ''
  for (let i = 0; i < PICKUP_CODE_LENGTH; i++) {
    code += PICKUP_CODE_ALPHABET[Math.floor(Math.random() * PICKUP_CODE_ALPHABET.length)]
  }
  return code
}

/** The shop's day, as a scoping key — callers pass a Date so tests control it. */
export function shopDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Generates a code unique among `existingCodesToday`. Uniqueness is scoped
 * to a single shop-day by the caller — it's the order store that knows
 * which codes are already issued for that scope, not this module.
 */
export function generatePickupCode(existingCodesToday: ReadonlySet<string>): string {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const code = randomCode()
    if (!existingCodesToday.has(code)) return code
  }
  throw new Error('Could not find a free pickup code — check the alphabet or the day scope')
}
