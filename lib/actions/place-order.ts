'use server'

import { ensureDeviceToken } from '../device-token.ts'
import { createOrder, setProviderRef, transitionOrder } from '../orders/store.ts'
import type { OrderLine } from '../orders/types.ts'
import { getProvider } from '../payments/registry.ts'
import { resolveCartLine } from '../resolve-cart-line.ts'
import { SHOP_ID, getShopState } from '../shop-state.ts'

export type PlaceOrderLineInput = {
  slug: string
  choices: Record<string, string>
  quantity: number
}

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: 'empty_cart' | 'shop_closed' | 'no_valid_lines' }

/**
 * docs/PAYMENTS.md §4 customer flow: written as `placed`, immediately moved
 * to `awaiting_payment`, then the provider is asked to `initiate()` — for
 * counter that just returns the pickup-code instruction already on the
 * order, but the call happens for real so phase 2's providers slot in here
 * unchanged.
 *
 * `idempotencyKey` is client-generated and must be the same value across a
 * retry of the same submission attempt — createOrder is what actually
 * enforces that a retry produces one order, not this function.
 */
export async function placeOrderAction(
  lines: PlaceOrderLineInput[],
  idempotencyKey: string,
): Promise<PlaceOrderResult> {
  if (lines.length === 0) return { ok: false, error: 'empty_cart' }
  if (!getShopState().isOpen) return { ok: false, error: 'shop_closed' }

  const orderLines: OrderLine[] = []
  for (const line of lines) {
    const resolved = resolveCartLine(line.slug, line.choices, line.quantity)
    if (!resolved) continue // a slug no longer on the menu — drop it, not the whole order
    if (resolved.item.soldOut) continue // sold out since it was added — same treatment
    orderLines.push({
      slug: line.slug,
      name: resolved.item.name,
      customizations: resolved.customizations,
      quantity: line.quantity,
      unitPrice: resolved.unitPrice,
      lineTotal: resolved.lineTotal,
    })
  }
  if (orderLines.length === 0) return { ok: false, error: 'no_valid_lines' }

  const deviceToken = await ensureDeviceToken()

  const order = createOrder(
    { shopId: SHOP_ID, lines: orderLines, providerId: 'counter', deviceToken },
    idempotencyKey,
    { type: 'customer', deviceToken },
  )

  const transitioned = transitionOrder(order.id, 'awaiting_payment', { type: 'system' })
  const current = transitioned.ok ? transitioned.order : order

  const { providerRef } = await getProvider('counter').initiate(current)
  setProviderRef(current.id, providerRef)

  return { ok: true, orderId: current.id }
}
