import { cookies } from 'next/headers'

import { SERVICE_TYPE_COOKIE, TABLE_NUMBER_COOKIE } from './service-context.ts'
import type { ServiceType } from './service-context.ts'

/**
 * Server-only counterpart to lib/service-context.ts's client-side writer —
 * kept in its own file because `next/headers` can't be imported into any
 * module a Client Component pulls in, even one that never calls the
 * server-only export at runtime.
 */
export type ServiceContext = {
  serviceType: ServiceType | null
  tableNumber: string | null
}

function isServiceType(value: string | undefined): value is ServiceType {
  return value === 'dine-in' || value === 'takeaway'
}

/** Read-only — safe from a Server Component render, same reasoning as peekDeviceToken. */
export async function peekServiceContext(): Promise<ServiceContext> {
  const store = await cookies()
  const serviceTypeRaw = store.get(SERVICE_TYPE_COOKIE)?.value
  return {
    serviceType: isServiceType(serviceTypeRaw) ? serviceTypeRaw : null,
    tableNumber: store.get(TABLE_NUMBER_COOKIE)?.value ?? null,
  }
}
