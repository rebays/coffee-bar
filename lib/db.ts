import { PrismaClient } from '@prisma/client'

/**
 * The one piece of durable storage in this app — see prisma/schema.prisma's
 * header comment. Anchored on globalThis for the same reason as every other
 * cross-layer store here (lib/orders/store.ts, lib/staff-auth.ts): Next.js
 * can load this module more than once within one process, and in dev mode
 * specifically, Fast Refresh re-evaluating this file on every edit would
 * otherwise open a fresh PrismaClient (and a fresh connection pool) each
 * time — this is also Prisma's own documented recommendation for Next.js.
 */
const globalDb = globalThis as unknown as { __coffeeBarPrisma?: PrismaClient }

export const db = globalDb.__coffeeBarPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalDb.__coffeeBarPrisma = db
}
