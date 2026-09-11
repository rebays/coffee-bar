import bcrypt from 'bcryptjs'

/**
 * bcryptjs, not the native `bcrypt` — pure JS, no native build step, so it
 * behaves the same regardless of what this app ends up deployed on. Cost 12
 * is bcrypt's own recommended floor as of today; it's deliberately slow,
 * which is the point — the same reasoning applies to verification codes in
 * lib/customers/verification.ts, which reuse this module.
 */
const SALT_ROUNDS = 12

export async function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, SALT_ROUNDS)
}

export async function verifySecret(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash)
}
