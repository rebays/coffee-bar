import type { Order } from '../orders/types.ts'
import { CounterProvider } from './counter.ts'
import type { PaymentProvider } from './provider.ts'

/**
 * docs/PAYMENTS.md §7.1: the provider interface and a registry exist from
 * day one, even though phase 1 only ever registers CounterProvider —
 * that's what makes phase 2 additive (new entries here) rather than a
 * rewrite of whatever currently hardcodes CounterProvider.
 */
function notBuiltYet(id: Order['providerId']): PaymentProvider {
  return {
    id,
    async initiate() {
      throw new Error(`payment provider "${id}" is not implemented yet (phase 2)`)
    },
    async reconcile() {
      throw new Error(`payment provider "${id}" is not implemented yet (phase 2)`)
    },
  }
}

function defaultProviders(): Record<Order['providerId'], PaymentProvider> {
  return {
    counter: CounterProvider,
    egate: notBuiltYet('egate'),
    mselen: notBuiltYet('mselen'),
  }
}

const providers = defaultProviders()

export function getProvider(id: Order['providerId']): PaymentProvider {
  return providers[id]
}

/** Test-only override — lets reconciler tests exercise paid/failed dispatch without a real phase-2 provider. */
export function __setProviderForTests(id: Order['providerId'], provider: PaymentProvider): void {
  providers[id] = provider
}

/** Test-only reset — mirrors __resetOrderStoreForTests. */
export function __resetRegistryForTests(): void {
  Object.assign(providers, defaultProviders())
}
