# Payments & order lifecycle

Phase 1 is order-only, pay at counter. Phase 2 adds ANZ eGate (card) and M-SELEN
(mobile money).

This document exists because **phase 1 is not a stub to be replaced.** All three
payment methods share one shape, and if phase 1 is built to that shape, phase 2 is
adding two adapters rather than rewriting the order system.

---

## 1. The shape all three share

None of these is a synchronous charge you can `await` and get an answer from.

| Method | Where payment happens | How you find out |
|---|---|---|
| Counter (phase 1) | At the till, in cash or EFTPOS | A staff member marks it paid |
| ANZ eGate | On an ANZ-hosted page, after leaving your site | Redirect back — **which you must not trust** — reconciled by polling |
| M-SELEN | In the M-SELEN app or `*123#`, entirely outside your app | Provider callback, or staff confirmation |

In every case the customer leaves your web app and confirmation arrives out of band,
possibly minutes later, possibly never. In two of the three the customer's browser may
never return at all — they close the tab, the connection drops, the phone locks.

So the rule for the whole system:

> **Order state advances only from server-side events. Never from the payment UI, and
> never from a redirect landing page.**

The counter flow has exactly this property already, with a barista in the role the
gateway will later play. Build it honestly and the adapters slot in.

---

## 2. Order state machine

Provider-agnostic. Do not add per-provider states.

```
            placed
              │
              ▼
      awaiting_payment ──────► payment_failed ──► cancelled
              │                       ▲
              │                       │ (expiry, decline, abandon)
              ▼
             paid
              │
              ▼
            making
              │
              ▼
            ready
              │
              ▼
          collected
```

- `placed` — order written, total locked, pickup code issued. Nothing has been paid.
- `awaiting_payment` — the customer has been told how to pay. In phase 1 this means
  "go to the counter"; in phase 2 it means a redirect is in flight or an M-SELEN push
  is pending.
- `paid` — a **server-side** event confirmed it. Never set from the client.
- `making` / `ready` / `collected` — kitchen states, advanced from the staff surface.

`awaiting_payment` expires. Default 20 minutes, configurable — an abandoned order must
not sit in the queue forever. Expiry moves it to `payment_failed`, then `cancelled`.

**One shop policy to confirm:** does the barista start making before payment clears?
Put it behind a `startMakingBeforePayment` flag rather than hardcoding either answer.
For counter payment the honest default is `false` — the customer is walking over
anyway. For eGate it should be `false`. For M-SELEN it depends how fast confirmation
lands.

---

## 3. Provider interface

```ts
type PaymentInstruction =
  | { kind: 'counter'; pickupCode: string; amount: number }
  | { kind: 'redirect'; url: string }
  | { kind: 'push';    merchantCode: string; reference: string; amount: number }

interface PaymentProvider {
  readonly id: 'counter' | 'egate' | 'mselen'

  /** Called once when the customer confirms the order. Must be idempotent
   *  on orderId — a retried submit must not create a second payment. */
  initiate(order: Order): Promise<{
    providerRef: string
    instruction: PaymentInstruction
  }>

  /** Authoritative status check. Safe to call repeatedly. This is what the
   *  reconciler uses, and it is the only thing allowed to move an order to paid. */
  reconcile(providerRef: string): Promise<'pending' | 'paid' | 'failed'>
}
```

Three implementations. Phase 1 ships `CounterProvider` only, but the interface and the
reconciler loop both exist from day one — that's the whole point.

Provider selection is server-side config, not a client choice, until phase 2 makes it a
customer choice.

---

## 4. Phase 1 — counter

`CounterProvider.initiate()` makes no external call. It issues the pickup code and
returns a `counter` instruction. `reconcile()` reads whatever the staff surface wrote.

### Pickup code

The single most important thing to get right in phase 1, because it is reused in
phase 2 as the M-SELEN payment reference and the eGate merchant order reference.
Design it once:

- **4 characters**, from a 24-character alphabet that omits `0 O 1 I L S 5` — these
  get misheard and mistyped across a noisy counter.
- Scoped **per shop per day**, so collisions are near-impossible in practice and the
  code stays short. `K7QX` is readable across a counter; a UUID is not.
- Displayed large on the customer's confirmation screen and searchable from the staff
  surface. It is how a human matches a paper docket to a database row.

### Customer flow

1. Customer taps **Place order** — no payment step, no card fields.
2. Order written as `placed`, immediately → `awaiting_payment`.
3. Confirmation screen: pickup code at `metric` size, total, and the instruction
   *"Pay at the counter. Show this code."*
4. Order status page polls; when staff mark it paid it advances to `making`.

Copy note: the button says **Place order**, not "Pay" or "Checkout" — nothing is being
paid. The toast says **Order placed**.

### Staff surface

Minimum viable, and it is not optional — without it the order is stuck at
`awaiting_payment` forever:

- Live list of orders in `awaiting_payment` and `making`, newest first, showing pickup
  code, items, total.
- **Mark paid** → `paid`. **Ready** → `ready`. **Collected** → `collected`.
- **Cancel** with a reason.
- Search by pickup code.

Behind auth, on a tablet behind the bar. This is where decision 5 (menu authoring)
lands too — same surface, later.

---

## 5. Phase 2a — ANZ eGate

eGate runs on Mastercard's MIGS platform. It offers two integration modes:
merchant-hosted, where card details are entered on your page and posted to the gateway,
and server-hosted, where the customer is redirected to an ANZ-branded page and returned
to your confirmation page afterwards.

**Use server-hosted.** Merchant-hosted pulls raw card data through your infrastructure
and drags full PCI DSS scope onto a coffee shop's app. There is no upside here.

### Mechanics

- Request is signed with an **SHA-256 secure hash**, using an access code and secure
  hash secret from eGate Merchant Administration. Both are secrets — server-side env
  vars, never in client code, never in the repo.
- The customer returns to your site with a signed response. **Verify the hash, then
  ignore the result as authoritative.** Treat the redirect as a hint that something
  happened, not as proof of payment.
- Reconcile with **QueryDR** (part of Advanced Merchant Administration over the Virtual
  Payment Client) to get the authoritative answer. This is `reconcile()`.

### Why the redirect can't be trusted

The customer is on mobile data at a counter in Honiara. The return trip fails routinely
— dropped connection, closed tab, backgrounded browser, phone locked mid-3DS. A payment
that succeeded at the bank but never got back to your app is the normal failure, not
the edge case. Without QueryDR reconciliation you charge people and lose their orders.

So: a background reconciler sweeps every order in `awaiting_payment` with an eGate
`providerRef`, calls QueryDR, and advances state. The redirect handler does nothing but
kick off the same check early.

### To confirm with ANZ before building

- **SBD support.** Published eGate material is written for AUD/NZD merchants. Confirm
  the Solomon Islands merchant profile transacts in SBD and what minor-unit convention
  the amount field expects.
- Test merchant ID and credentials (the `TEST` prefix convention).
- Whether AMA / QueryDR is enabled on the account — it is a permission, not automatic.
- 3DS requirements on the merchant profile.

---

## 6. Phase 2b — M-SELEN

M-SELEN is Our Telekom's mobile money platform, operated by Telekom Digital Limited.
Its merchant service, *Buy Goods and Services*, launched to full commercial rollout in
2025. Customers pay from the M-SELEN app or by dialling `*123#`, then scan a merchant
QR code or type a merchant code — so it works on basic phones as well as smartphones,
which matters for reach here.

### The architectural consequence

This flow is **customer-initiated and entirely outside your application**. Your web app
cannot start, drive, or cancel it. It can only:

1. Display the merchant code (or QR), the exact amount, and a reference — the pickup
   code from §4.
2. Wait for confirmation to arrive from somewhere else.
3. Match the incoming payment to the order by amount + reference.

That is a `push` instruction in the interface, and it is why the pickup code was
designed to be typed by a human in §4 rather than being a UUID.

### The open question

A merchant-facing API — callbacks, transaction query, settlement reporting — is not
publicly documented. Treat the integration surface as unknown until Telekom Digital
provides merchant developer documentation. **Get that conversation started early;** it
is likely the long pole in phase 2, well ahead of any code.

Design the adapter so that any of the three plausible answers fits without touching the
order system:

- **Webhook** — Telekom posts confirmations to your endpoint. `reconcile()` reads what
  the webhook stored. Best case.
- **Polling** — a merchant transaction-query endpoint. `reconcile()` calls it directly.
- **Manual** — no API at all. Staff see the payment land in the merchant app and tap
  **Mark paid**, exactly as in phase 1. Degrades to the counter flow, which still works.

The third case is why phase 1 must be built properly rather than thrown away.

---

## 7. What to build in phase 1 so phase 2 is additive

Do these now even though counter payment needs none of them:

1. **The `PaymentProvider` interface and a provider registry**, with `CounterProvider`
   as the only entry.
2. **The reconciler loop** — a scheduled sweep over `awaiting_payment` orders calling
   `reconcile()`. For counter it's a cheap database read. For eGate and M-SELEN it
   becomes the thing that saves you.
3. **Idempotency keys on every state transition**, keyed by order id and target state.
   Gateway callbacks retry, redirects get replayed, and customers double-tap on bad
   connections. A transition that runs twice must be a no-op the second time.
4. **A client-generated idempotency key on order submission**, so a retry over a flaky
   connection cannot create two orders.
5. **Money as integers in SBD minor units**, everywhere. Format only at render. No
   floats in any total, delta, or tax calculation.
6. **An immutable `order_events` audit log** — every transition with timestamp, actor
   (customer / staff id / provider), and provider payload. When a payment is disputed,
   this is the only thing that will settle it.
7. **Order survives the browser.** Anonymous device token in an httpOnly cookie plus
   the order id in the URL, so a customer who closes the tab, or gets redirected to ANZ
   and back, or drops into USSD, can still reach their order.
8. **Totals locked at `placed`.** Never recompute a total from current menu prices. If
   an item's price changes while an order is open, the order keeps the price the
   customer agreed to.

Point 8 matters more than it sounds: it's the difference between a price change being a
routine edit and a price change silently altering what people already owe.

---

## 8. Not in scope for phase 1

Explicitly deferred, so nobody builds them speculatively:

- Refunds. Counter refunds happen at the till, outside the app.
- Tipping.
- Split payment.
- Saved cards or wallets — eGate server-hosted holds no card data on your side.
- Receipts by email or SMS. The pickup code screen is the receipt in phase 1.
