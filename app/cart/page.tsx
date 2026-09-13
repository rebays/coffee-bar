'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { MSelenProcessingOverlay } from '@/components/cart/mselen-processing-overlay'
import { Button } from '@/components/ui/button'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { Stepper } from '@/components/ui/stepper'
import { placeOrderAction } from '@/lib/actions/place-order'
import { clearCart, getCartLines, removeLine, setLineQuantity, useCartSummary } from '@/lib/cart-store'
import { formatSBD, formatSBDSpoken } from '@/lib/money'
import { showToast } from '@/lib/toast-store'
import type { ShopState } from '@/lib/types'

type ShopStateResponse = ShopState & { demoMode: boolean }

const ERROR_COPY: Record<string, string> = {
  empty_cart: 'Your order is empty.',
  shop_closed: "The shop's closed right now — try again during opening hours.",
  no_valid_lines: 'Those items are no longer on the menu. Please update your order.',
}

/**
 * Line editing plus submission. The idempotency key is generated once per
 * mount (not per click) — docs/PAYMENTS.md §7.4 requires the *same* key
 * across a retry of one submission attempt, and this page only remounts
 * (getting a fresh key) once the customer starts a genuinely new order.
 */
export default function CartPage() {
  const router = useRouter()
  const { resolved, itemCount, total } = useCartSummary()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [idempotencyKey] = useState(() => crypto.randomUUID())
  // Server-authoritative — lib/actions/place-order.ts rejects the submit
  // either way, but this disables the button up front instead of only
  // erroring after a tap. Not derived from the browser's own clock: that's
  // trivially changeable client-side and this is what gates checkout.
  const [shopState, setShopState] = useState<ShopStateResponse | null>(null)
  // Set only for the simulated M-SELEN flow — while non-null, the overlay
  // takes over the screen until the order's real state (confirmed
  // server-side) leaves awaiting_payment. See mselen-processing-overlay.tsx.
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)
  // A real push-payment flow needs the customer's own number before a
  // prompt can be sent anywhere — cosmetic here (the demo provider doesn't
  // actually dial anyone), but it's what makes tapping the button "send a
  // request to this specific number" rather than a hardcoded placeholder.
  const [mselenPhone, setMselenPhone] = useState('')
  const mselenPhoneValid = mselenPhone.replace(/\D/g, '').length >= 7

  useEffect(() => {
    fetch('/api/shop-state', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then(setShopState)
      .catch(() => setShopState(null))
  }, [])

  const shopClosed = shopState !== null && !shopState.isOpen

  async function submit(providerId: 'counter' | 'mselen') {
    setPending(true)
    setError(null)

    const lines = getCartLines().map((line) => ({
      slug: line.slug,
      choices: line.choices,
      quantity: line.quantity,
      notes: line.notes,
    }))
    const result = await placeOrderAction(lines, idempotencyKey, providerId)

    if (!result.ok) {
      setError(ERROR_COPY[result.error] ?? 'Something went wrong placing your order.')
      setPending(false)
      return
    }

    clearCart()
    if (providerId === 'mselen') {
      setProcessingOrderId(result.orderId)
      return
    }
    showToast('Order placed')
    router.push(`/order/${result.orderId}`)
  }

  if (processingOrderId) {
    return (
      <MSelenProcessingOverlay
        orderId={processingOrderId}
        phoneNumber={mselenPhone}
        onConfirmed={() => router.push(`/order/${processingOrderId}`)}
      />
    )
  }

  if (resolved.length === 0) {
    return (
      <main className="px-gutter flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <h1 className="sr-only">Your order</h1>
        <p className="text-body text-secondary">Nothing in your order yet.</p>
        <Link href="/menu" className="text-accent text-body font-semibold">
          Browse the menu
        </Link>
      </main>
    )
  }

  return (
    <main
      className="mx-auto flex w-full flex-1 flex-col"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <div className="px-gutter flex items-center gap-2 pt-4">
        <Link
          href="/menu"
          aria-label="Back to menu"
          className="tap-expand text-secondary inline-flex items-center justify-center rounded-full"
          style={{ inlineSize: '2.25rem', blockSize: '2.25rem' }}
        >
          <BackArrow />
        </Link>
        <h1 className="text-title">Your order</h1>
      </div>

      <ul className="divide-hairline px-gutter mt-2 flex-1 divide-y">
        {resolved.map(({ line, item, customizations, unitPrice, lineTotal }) => (
          <li key={line.id} className="flex items-start gap-4 py-4">
            <ItemThumbnail src={item.imageUrl} size={56} />
            <div className="min-w-0 flex-1">
              <p className="text-item">{item.name}</p>
              {customizations.length > 0 ? (
                <p className="text-body text-secondary">{customizations.join(' · ')}</p>
              ) : null}
              {line.notes ? <p className="tasting-note mt-1">“{line.notes}”</p> : null}
              <p className="text-spec wdth-condensed text-tertiary mt-1">
                {formatSBD(unitPrice)} each
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-price" aria-label={formatSBDSpoken(lineTotal)}>
                {formatSBD(lineTotal)}
              </span>
              <Stepper
                value={line.quantity}
                onChange={(next) => setLineQuantity(line.id, next)}
                onRemove={() => removeLine(line.id)}
                itemLabel={item.name}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="border-hairline bg-raised safe-bottom px-gutter sticky bottom-0 flex flex-col gap-3 border-t py-4">
        {error ? (
          <p className="text-danger-text text-small">{error}</p>
        ) : shopClosed ? (
          <p className="text-danger-text text-small">
            {`The shop's closed right now — opens ${shopState!.opensAgainToday ? 'today' : 'tomorrow'} at ${shopState!.opensAt}.`}
          </p>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="text-body text-secondary">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-price" aria-label={formatSBDSpoken(total)}>
            SBD {formatSBD(total)}
          </span>
        </div>
        <Button size="lg" block disabled={pending || shopClosed} onClick={() => submit('counter')}>
          {pending ? 'Placing order…' : 'Place order'}
        </Button>
        {shopState?.demoMode ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="mselen-phone" className="text-small text-secondary">
              M-SELEN mobile number
            </label>
            <input
              id="mselen-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="74XXXXX"
              value={mselenPhone}
              onChange={(event) => setMselenPhone(event.target.value)}
              className="border-hairline rounded-input text-body border p-3"
            />
            <Button
              size="lg"
              block
              variant="secondary"
              disabled={pending || shopClosed || !mselenPhoneValid}
              onClick={() => submit('mselen')}
            >
              Pay with M-SELEN
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  )
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d="M10 3L5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
