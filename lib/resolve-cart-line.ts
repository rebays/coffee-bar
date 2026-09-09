import { getOptionGroups } from './fixtures.ts'
import { getMenuItem } from './menu-store.ts'
import { addMoney, multiplyMoney } from './money.ts'
import type { Money } from './money.ts'
import type { MenuItem } from './types.ts'

/**
 * The pricing/resolution logic a cart line and an order line both need.
 * Deliberately has no 'use client' directive — lib/cart-store.ts (client)
 * and the place-order Server Action both call this, and a plain function
 * exported from a 'use client' module isn't safely importable from server
 * code, so the shared logic lives here instead of in either of them.
 */
export type ResolvedLine = {
  item: MenuItem
  /**
   * Selected choices worth stating in a summary: any non-default choice,
   * plus every `alwaysShow` group's choice regardless of default (see
   * OptionGroup.alwaysShow — sweetness is always stated, milk only when
   * it's not "whole").
   */
  customizations: string[]
  unitPrice: Money
  lineTotal: Money
}

export function resolveCartLine(
  slug: string,
  choices: Record<string, string>,
  quantity: number,
): ResolvedLine | null {
  const item = getMenuItem(slug)
  if (!item) return null

  const deltas: Money[] = []
  const customizations: string[] = []

  for (const group of getOptionGroups(item)) {
    const choiceId = choices[group.id]
    const choice = group.choices.find((c) => c.id === choiceId)
    if (!choice) continue
    deltas.push(choice.priceDelta)
    if (group.alwaysShow || choiceId !== group.defaultChoiceId) customizations.push(choice.label)
  }

  const unitPrice = addMoney(item.basePrice, ...deltas)
  return { item, customizations, unitPrice, lineTotal: multiplyMoney(unitPrice, quantity) }
}
