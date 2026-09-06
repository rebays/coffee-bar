# Build plan

Phase 1: order-only, pay at counter. Sequenced so each step is independently
reviewable. Nothing here is blocked.

Steps 8–10 look like more work than they are, but they are what make phase 2 additive
rather than a rewrite. See `docs/PAYMENTS.md` §7.

---

## 1. Scaffold

Next.js App Router + TypeScript + Tailwind v4.

- Drop the supplied `globals.css` in at `app/globals.css` unmodified.
- **Do not create `tailwind.config.js`.** Tailwind v4 configures in CSS.
- Wire Bricolage Grotesque in `app/layout.tsx` exactly as shown in `CLAUDE.md`.
- Set `data-theme` on `<html>`, defaulting to `light`.

**Done when:** a bare page renders in Bricolage, `pnpm typecheck` and `pnpm lint` pass,
and toggling `data-theme="dark"` in devtools flips the whole page.

---

## 2. Types, money and fixtures

`lib/money.ts` first — integer SBD minor units, a `formatSBD()` used only at render,
and no float arithmetic anywhere.

Then `lib/types.ts` and `lib/fixtures.ts` with ~14 real menu items across the five
categories (Espresso, Filter, Cold, Not coffee, Food).

```ts
type Category = 'espresso' | 'filter' | 'cold' | 'other' | 'food'
type RoastLevel = 'light' | 'medium' | 'dark'

type OptionChoice = {
  id: string
  label: string          // "Oat"
  priceDelta: number     // minor units, may be 0
}

type OptionGroup = {
  id: string
  label: string          // "Milk"
  required: boolean
  choices: OptionChoice[]
  defaultChoiceId: string
}

type MenuItem = {
  slug: string
  name: string
  description: string
  tastingNote?: string   // origin items only — renders in the `note` role
  roast?: RoastLevel     // origin items only
  spec: string           // "2 shots · 180ml · whole milk"
  basePrice: number      // minor units
  category: Category
  tags: string[]
  isNew?: boolean
  soldOut?: boolean
  imageUrl?: string
}
```

Write real copy, not lorem. Descriptions are one line; tasting notes are three or four
comma-separated flavour terms. Prices in SBD.

**Done when:** every category has at least two items, including one sold-out item and
one origin item with a roast level, and `formatSBD()` has unit tests covering rounding.

---

## 3. Primitives — `components/ui/`

`Button`, `Chip`, `Stepper`, `Tag`, `Skeleton`. Build to `docs/DESIGN-SYSTEM.md` §7.

Consume `var(--accent)` and friends, never a hardcoded hex. Disabled states use
`slate-100` fill and `slate-400` text, never opacity. All pill radius.

**Done when:** a scratch `/style-guide` route shows every variant and size in both
themes, and every one is reachable and visibly focused by keyboard.

---

## 4. Menu row and list

`components/menu/menu-row.tsx` plus the list. The highest-traffic component in the
product — get it right before anything is layered on.

- Fixed 72px price rail so prices align down the column.
- Name at weight 600, description at 400, spec line at 12px / `font-stretch: 90%`.
- Origin items lead with the roast segment bar; others have no marker.
- Sold out: visible, price struck through, `[+]` disabled, `Sold out` tag. Never hidden.
- Descriptions clamp to two lines.

**Done when:** prices align perfectly down a list of wildly varying name lengths, and
the row holds at 320px width.

---

## 5. Menu screen

Status strip → hero → category rail → list. Server Component; the rail filters
client-side.

The hero shows live shop state, not a photo: today's filter origin, its tasting note,
roast, and the current wait. Stub behind `lib/shop-state.ts` returning static data.

**Done when:** the full screen renders at 320px, 390px and 768px, the rail scrolls
horizontally without a visible scrollbar, and nothing shifts on font load.

---

## 6. Item sheet

Route `app/item/[slug]/page.tsx`, presented as a bottom sheet over the menu.

- Real route: browser back closes it, the URL is shareable.
- Order: image → name → description → tasting note → option groups → notes field →
  sticky footer with stepper and `Add to order · $6.50`.
- Focus trapped while open, restored to the triggering row on close.
- Footer price updates live as options change.

**Done when:** deep-linking to `/item/flat-white` works from cold, and back returns to
the menu at the previous scroll position.

---

## 7. Cart

`lib/cart-store.ts` — client-side, integer minor units. A line is an item slug plus
resolved option choices plus quantity; identical configurations merge into one line.

Then the cart bar and `app/cart/page.tsx`.

- Cart bar is black, renders only when non-empty, is one tap target.
- **The one orchestrated moment:** `[+]` fills cyan and holds 120ms, the count swaps
  upward over 180ms, the bar rises from below on the first item. Use `.animate-count-swap`
  and `.animate-bar-rise`. Nothing else in the app animates on its own.
- Empty cart: "Nothing in your order yet." + `Browse the menu`.

**Done when:** the same drink with different milk produces two lines, twice with the
same milk produces one line at quantity 2, and the total is correct to the cent.

---

## 8. Order model and payment abstraction

Read `docs/PAYMENTS.md` in full before starting this step.

Build:

- The order state machine from §2 — one set of states, no per-provider states.
- `lib/payments/provider.ts` — the `PaymentProvider` interface from §3.
- `lib/payments/counter.ts` — `CounterProvider`. `initiate()` issues the pickup code
  and makes no external call; `reconcile()` reads what staff wrote.
- Pickup code generation per §4: 4 characters, alphabet excluding `0 O 1 I L S 5`,
  scoped per shop per day.
- `order_events` — immutable append-only audit log, every transition with timestamp,
  actor and payload.
- Idempotency on every transition, keyed by order id + target state.
- A client-generated idempotency key on order submission.
- Totals locked at `placed`. Never recomputed from current menu prices.

**Done when:** replaying the same transition twice is a no-op, submitting the same
order twice with one idempotency key creates one order, and every state change appears
exactly once in `order_events`.

---

## 9. Place order and confirmation

- Button reads **Place order**, not "Pay" or "Checkout". Toast: **Order placed**.
- Confirmation screen: pickup code at `metric` size, total, and
  *"Pay at the counter. Show this code."*
- `app/order/[id]/page.tsx` polls status and shows the four-state progression.
- Anonymous device token in an httpOnly cookie plus order id in the URL, so closing the
  tab does not lose the order.
- `awaiting_payment` expires after 20 minutes (configurable) → `payment_failed`.

**Done when:** the order survives a full browser close and reopen, and the pickup code
is legible across a room at arm's length.

---

## 10. Staff surface

`app/staff/page.tsx`, behind auth. Without this, orders are stuck at
`awaiting_payment` forever — it is not optional.

- Live list of `awaiting_payment` and `making`, newest first, with pickup code, items,
  total.
- **Mark paid** → `paid`. **Ready** → `ready`. **Collected** → `collected`.
- **Cancel** with a reason.
- Search by pickup code.
- Honour the `startMakingBeforePayment` flag.

Tablet-first layout, `data-density="kiosk"` for the larger targets.

**Done when:** a full order can be driven from placed to collected from this screen,
and every transition is in `order_events` with the staff member as actor.

---

## 11. Reconciler loop

A scheduled sweep over `awaiting_payment` orders calling `provider.reconcile()`.

For `CounterProvider` this is a cheap database read and looks pointless. Build it
anyway — in phase 2 it is the thing that recovers eGate payments whose redirect never
came back, which is the normal failure on a Honiara mobile connection, not the edge
case.

**Done when:** the sweep runs on a schedule, is safe to run concurrently with itself,
and expires stale orders.

---

## Phase 2 — not yet

`docs/PAYMENTS.md` §5 and §6. Two things gate it, both external:

- **ANZ** — confirm SBD support on the Solomon Islands merchant profile, get test
  credentials, and confirm AMA / QueryDR is enabled on the account.
- **Telekom Digital** — merchant developer documentation for M-SELEN *Buy Goods and
  Services* is not public. Start that conversation early; it is likely the long pole,
  well ahead of any code.

---

## Review gates

At the end of each step:

- `pnpm lint && pnpm typecheck` clean
- Renders correctly in both `data-theme` values
- Every interactive element reachable and visibly focused by keyboard
- No hardcoded colour hex outside `globals.css`
- No `font-variation-settings`, no `italic`, no `tailwind.config.js`
- No float arithmetic on money
- No order state advanced from client code
