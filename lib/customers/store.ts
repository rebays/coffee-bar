import type { Customer, VerificationChannel } from '@prisma/client'

import { db } from '../db.ts'

export type { Customer, VerificationChannel }

/**
 * Everything that actually touches the database lives here — the same
 * division of labour as lib/orders/store.ts (I/O) versus
 * lib/orders/state-machine.ts (pure rules): lib/customers/verification.ts
 * and lib/validation/contact.ts hold the testable logic, this file just
 * reads and writes rows.
 */

export function findCustomerByPhone(phone: string): Promise<Customer | null> {
  return db.customer.findUnique({ where: { phone } })
}

export function createPendingCustomer(input: {
  fullName: string
  phone: string
  passwordHash: string
}): Promise<Customer> {
  return db.customer.create({
    data: {
      fullName: input.fullName,
      phone: input.phone,
      passwordHash: input.passwordHash,
      verified: false,
    },
  })
}

export function getCustomerById(id: string): Promise<Customer | null> {
  return db.customer.findUnique({ where: { id } })
}

export function markCustomerVerified(id: string): Promise<Customer> {
  return db.customer.update({ where: { id }, data: { verified: true } })
}

export function getLatestVerificationCode(customerId: string) {
  return db.verificationCode.findFirst({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * At most one live code per customer: a resend (or a fresh signup retried
 * with the same contact — see docs/PAYMENTS.md-style idempotency reasoning
 * elsewhere in this app) replaces whatever code existed before rather than
 * leaving an old one guessable alongside the new one.
 */
export async function replaceVerificationCode(input: {
  customerId: string
  channel: VerificationChannel
  codeHash: string
  expiresAt: Date
  now: Date
}) {
  return db.$transaction(async (tx) => {
    await tx.verificationCode.deleteMany({ where: { customerId: input.customerId } })
    return tx.verificationCode.create({
      data: {
        customerId: input.customerId,
        channel: input.channel,
        codeHash: input.codeHash,
        expiresAt: input.expiresAt,
        lastSentAt: input.now,
      },
    })
  })
}

export function incrementVerificationAttempts(codeId: string) {
  return db.verificationCode.update({
    where: { id: codeId },
    data: { attemptCount: { increment: 1 } },
  })
}

/**
 * Marks the code consumed and the customer verified in one transaction —
 * a code must never be usable twice, even under a concurrent double-submit.
 */
export function consumeVerificationCode(codeId: string, customerId: string, now: Date) {
  return db.$transaction([
    db.verificationCode.update({ where: { id: codeId }, data: { consumedAt: now } }),
    db.customer.update({ where: { id: customerId }, data: { verified: true } }),
  ])
}

export function createCustomerSession(customerId: string, token: string) {
  return db.customerSession.create({ data: { token, customerId } })
}

export async function getCustomerBySessionToken(token: string): Promise<Customer | null> {
  const session = await db.customerSession.findUnique({
    where: { token },
    include: { customer: true },
  })
  return session?.customer ?? null
}

export function deleteCustomerSession(token: string) {
  return db.customerSession.delete({ where: { token } }).catch(() => {
    // Already gone (e.g. a double logout click) — deleting a deleted
    // session is a no-op, not an error, matching this app's general
    // idempotent-transition stance (docs/CLAUDE.md #11).
  })
}
