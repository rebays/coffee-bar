/**
 * Split out from staff-auth.ts so this pure check can run under plain
 * `node --test`: staff-auth.ts imports `next/headers`, which only resolves
 * inside the Next.js runtime, not Node's own ESM resolution — the same
 * reason lib/device-token.ts has no test file of its own.
 */
const PASSCODE = process.env.STAFF_PASSCODE ?? 'honiara-staff'

export function verifyStaffPasscode(input: string): boolean {
  return input === PASSCODE
}
