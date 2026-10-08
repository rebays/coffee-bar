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
  layout.tsx              root — fonts, theme setup, page texture, bottom nav
  globals.css             the entire token layer. Do not add tokens elsewhere.
  page.tsx                redirects to /menu, keeping the query (old table QRs)
  menu/page.tsx           the menu: header, hero, search, category cards
  item/[slug]/page.tsx    item sheet (a real route, not a modal-only component)
  cart/page.tsx
  order/[id]/page.tsx     order status + pickup code
  orders/page.tsx         this device's past orders
  staff/page.tsx          staff surface (auth required)
  kitchen/page.tsx        kitchen display
components/
  header.tsx, bottom-nav.tsx, theme-toggle.tsx
  ui/                     button, chip, stepper, tag, skeleton, modal, toast host
  menu/                   menu-hero, search-bar, menu-body, category-accordion,
                          category-illustration, menu-item-card, menu-section
  cart/                   cart-button, add-to-cart-button
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

### 2. Two faces, and where each goes

```tsx
// app/layout.tsx
const urbanist = Urbanist({ subsets: ['latin'], style: ['normal'], variable: '--font-urbanist' })
const robotoFlex = Roboto_Flex({ subsets: ['latin'], axes: ['opsz'], variable: '--font-roboto-flex' })
```

- **Urbanist** — titles, section headings, item names, metrics. The `text-title`,
  `text-section`, `text-display`, `text-item` and `text-metric` roles apply it.
- **Roboto Flex** — everything else; the body default. Its optical size runs on
  `font-optical-sizing: auto`. Never use `font-variation-settings` anywhere — it
  silently disables that.

No italic, no emoji. Icons are Lucide (`lucide-react`) line icons, `aria-hidden`,
labelled by text or `aria-label`.

### 3. Teal has two jobs, and they use different tokens

White on `#0D9488` is 3.7:1 — under the floor. So:

- **Text-bearing fills** (buttons, the **Add +** pill, badges, the active order step)
  use `bg-accent` + `text-on-accent` — `#0F766E` with white in light, `#2DD4BF` with
  near-black `#042F2E` in dark.
- **Marks** (icons, the brand mark, the open dot, radio rings, selected borders, done
  steps) use `text-brand` / `bg-brand` / `border-brand`.
- Small text that must read as "active" (the current nav tab) uses `text-accent`,
  not `text-brand`.

Never hardcode a hex in a component; never reference the raw palette directly.

### 4. Light first, dark on request

The customer app is light by default (`data-theme="light"` is server-rendered). The
header toggle (`components/theme-toggle.tsx`) switches to dark and saves it; the
inline script in `app/layout.tsx` applies a saved "dark" before first paint. The
toggle's icon shows the current mode. Check every new surface in both. Staff and
kitchen pin `data-theme="dark"` on their own root.

### 5. Cards, shadows, texture and illustrations

Cards are `surface-card` (warm-white fill, 20px radius, a soft neutral shadow in
light, a faint 1px border in dark). Shadows are never teal. The page grain
(`.page-texture`) stays faint enough never to affect text contrast. No gradient
fills on buttons or cards.

Illustrations (`components/menu/category-illustration.tsx`) stand in for missing
photos and use only the `--illo-*` palette. Those colours are for drawings — never
for UI state, text or controls.

### 6. Colour has fixed meanings

- **Teal** is action, selection, icons and badges.
- **Mint** (`--color-highlight`) is today's special and nothing else.
- **Red** is errors and destructive actions. The open-store state uses teal,
  always paired with the words "Open now".
- Everything else is neutral surface and text. If a new element seems to need
  another colour, that is a design question — stop and ask.

### 7. Money is integer minor units, in SBD

Store and pass prices as integers. Format only at the render boundary via
`lib/money.ts`. No floats in any total, delta, or tax calculation.

### 8. Never animate type

Do not transition or animate `font-weight` or `font-stretch` (state changes swap them
instantly). It forces glyph re-rasterisation every frame and janks on mid-range
phones. Animate `transform` and `opacity` only.

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
- State is never colour alone — selected options fill the radio *and* gain weight,
  sold-out strikes through *and* mutes, the live step carries a text label.
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
