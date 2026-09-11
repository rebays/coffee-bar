/**
 * Signup input validation — pure and synchronous so it's cheap to check on
 * both the client (immediate feedback) and the server (the actual gate,
 * since client-side checks are trivially bypassed).
 *
 * Phone-only: customer signup, login and OTP delivery all key off phone
 * number, so this module no longer carries email validation at all — see
 * prisma/schema.prisma's Customer.email comment for why the column itself
 * still exists (nullable, just unused by auth).
 */

const COUNTRY_CODE = '677'
const LOCAL_NUMBER_LENGTH = 7

/**
 * Solomon Islands customers commonly dial the bare 7-digit local number
 * (the placeholder on /signup and /login shows "+677 7XXXXXX"); this always
 * normalizes to one consistent +677-prefixed form so the same real number
 * typed two different ways ("7412345" vs "+677 741 2345") can't slip past
 * the unique constraint as two different accounts.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const local = digits.startsWith(COUNTRY_CODE) ? digits.slice(COUNTRY_CODE.length) : digits
  return `+${COUNTRY_CODE}${local}`
}

const NORMALIZED_PHONE_PATTERN = new RegExp(`^\\+${COUNTRY_CODE}\\d{${LOCAL_NUMBER_LENGTH}}$`)

export function isValidPhone(phone: string): boolean {
  return NORMALIZED_PHONE_PATTERN.test(normalizePhone(phone))
}

const MIN_PASSWORD_LENGTH = 8

export function passwordMeetsPolicy(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH
}

export type SignupFieldErrors = Partial<{
  fullName: string
  phone: string
  password: string
  confirmPassword: string
}>

/**
 * One gate for every signup-field rule, shared by the server action and
 * (via the same import) the client form's inline validation, so the two
 * can never quietly disagree on what counts as valid.
 */
export function validateSignupFields(input: {
  fullName: string
  phone: string
  password: string
  confirmPassword: string
}): SignupFieldErrors {
  const errors: SignupFieldErrors = {}

  if (input.fullName.trim().length === 0) {
    errors.fullName = 'Enter your full name.'
  }

  if (!isValidPhone(input.phone)) {
    errors.phone = 'Enter a valid Solomon Islands phone number.'
  }

  if (!passwordMeetsPolicy(input.password)) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}
