# CLAUDE.md

Digital menu and ordering app for a coffee bar in Honiara, Solomon Islands. Customers
scan a QR at the counter or table, browse the menu on their own phone, configure a
drink, and place an order. A kiosk density mode reuses the same tokens for a shared
in-store device.

**Phase 1 is order-only — payment happens at the counter.** Phase 2 adds ANZ eGate
(card) and M-SELEN (mobile money).

Read these before writing code:

- `docs/DESIGN-SYSTEM.md` — colour, type, spacing, geometry, motion, component specs
- `docs/PAYMENTS.md` — order lifecycle and the provider abstraction
- `docs/BUILD-PLAN.md` — sequenced work with completion criteria

This file covers only what is easy to get wrong.

---

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS **v4**
- React Server Components by default

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
```

---

## Layout

```
app/
  layout.tsx              root — font + theme setup
  globals.css             the entire token layer. Do not add tokens elsewhere.
  page.tsx                menu
  item/[slug]/page.tsx    item sheet (a real route, not a modal-only component)
  cart/page.tsx
  order/[id]/page.tsx     order status + pickup code
  staff/page.tsx          staff surface (auth required)
components/
  ui/                     button, chip, stepper, tag, sheet, skeleton
  menu/                   menu-row, category-sidebar, hero, status-strip
  cart/                   cart-bar, cart-list
lib/
  types.ts
  money.ts                integer minor units, SBD
  cart-store.ts
  payments/               provider interface + counter provider + reconciler
docs/
```

---

## Things that will be got wrong

### 1. Tailwind v4 has no JS config

There is no `tailwind.config.js` and one must not be created. All tokens live in
`app/globals.css` under `@theme` and `@theme inline`. Adding a JS config silently
splits the token source in two.

### 2. Never use `font-variation-settings`

Bricolage Grotesque's axes are driven through standard CSS properties:

| Axis | Property |
|---|---|
| `wght` 200–800 | `font-weight` |
| `wdth` 75–100 | `font-stretch`, as a **percentage** |
| `opsz` 12–96 | `font-optical-sizing: auto` |

`font-variation-settings` takes a lower-level path that suppresses automatic optical
sizing in several engines. Using it anywhere in the tree silently kills the opsz axis,
which is the main reason this face was chosen.

### 3. Font setup

```tsx
// app/layout.tsx
import { Bricolage_Grotesque } from 'next/font/google'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz', 'wdth'],   // wght is the default axis — listing it is an error
  variable: '--font-bricolage',
})
```

Bricolage ships **upright only**. There is no italic. Do not write `italic` or
`font-style: italic` anywhere. Tasting notes use the `note` role — weight 350, +0.01em
tracking — which is the replacement treatment.

### 4. Width condenses, never expands

The `wdth` axis caps at 100. Item names sit at 100%; only the 12px spec line drops to
90%. Never widen type to emphasise it.

### 5. Cyan has two stops for one role

Bright cyan on white is ~1.9:1. Light mode uses `cyan-600`, dark mode uses `cyan-300`.
Crossing them is the one way this palette breaks:

- Never `cyan-200`–`cyan-400` on white
- Never `cyan-600`–`cyan-900` on black

Always consume `var(--accent)` / `--color-accent`, which is re-pointed per theme.
Never hardcode a cyan hex in a component.

### 6. Colour has fixed meanings

- **Black** is structure — text, status strip, cart bar. Never a call to action.
- **Cyan** is action and "happening right now". Nothing decorative is cyan.
- **White** is the page.

If a new element seems to need a fourth colour, that is a design question — stop and
ask rather than inventing a token.

### 7. Money is integer minor units, in SBD

Store and pass prices as integers. Format only at the render boundary via
`lib/money.ts`. No floats in any total, delta, or tax calculation.

### 8. Never animate type axes

Do not transition or animate `font-stretch` or `font-weight`. It forces glyph
re-rasterisation every frame and janks on mid-range phones. Animate `transform` and
`opacity` only.

---

## Payment rules

Full detail in `docs/PAYMENTS.md`. The three that must never be violated:

### 9. Order state advances only from server-side events

Never from the payment UI, never from a redirect landing page. In phase 1 a staff
member is the confirming authority; in phase 2 it is a gateway. Same rule.

### 10. Phase 1 is not a stub

Counter payment, eGate and M-SELEN are all out-of-band confirmations that may arrive
minutes later or never. They share one state machine and one `PaymentProvider`
interface. Build the interface, the reconciler loop and the audit log in phase 1 even
though `CounterProvider` barely needs them.

### 11. Every state transition is idempotent

Keyed by order id and target state. Gateway callbacks retry, redirects get replayed,
and customers double-tap on bad connections. A transition that runs twice is a no-op
the second time. Order submission carries a client-generated idempotency key for the
same reason.

Also: totals are locked at `placed` and never recomputed from current menu prices.

---

## Conventions

- Server Components by default. `'use client'` only for the cart store, the stepper,
  chips, and the theme toggle.
- The item sheet is a real route so back closes it and links are shareable. Render it
  as a bottom sheet, not a modal-only component.
- Every interactive element gets a visible `:focus-visible` ring. Never
  `outline: none` without a replacement.
- Minimum touch target 44×44 (`--tap-min`); kiosk mode 56×56 via `data-density="kiosk"`.
- State is never colour alone — selected chips fill *and* gain weight, sold-out strikes
  through *and* mutes, the live step carries a text label.
- All numerals use `font-variant-numeric: tabular-nums` (set globally in `globals.css`).
- Copy: sentence case, active voice, name the outcome. The phase 1 button is **Place
  order**, not "Pay" or "Checkout" — nothing is being paid — and it produces a toast
  reading **Order placed**.
- Errors state what happened and what to do. They do not apologise.
- Assume a slow, intermittent mobile connection. Optimistic UI needs a real rollback
  path, not a spinner that never resolves.

---

## Still open — stop and ask

1. **Kiosk** — shared in-store device in v1, or phone-only? Affects session handling
   and idle reset, not the tokens.
2. **Identity** — guest checkout only, or accounts with reorder and a stamp card?
3. **Multi-location** — one bar or several? Changes the data model at the root.
4. **Staff surface scope** — order management only, or menu editing and sold-out
   toggling too?
5. **`startMakingBeforePayment`** — does the barista start before the till confirms?
   Build the flag; ask the shop for the default.
