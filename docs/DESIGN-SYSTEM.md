# Coffee Bar Menu — Design System v5.0 ("Greige and teal")

Target: mobile-first ordering on the customer's own phone (QR at table / counter),
with a kiosk density mode reusing the same tokens. Next.js App Router + Tailwind v4.

**Brand:** light, calm and premium. A soft greige page with a faint paper grain,
warm-white cards with soft shadows, charcoal text, and a refined teal-green for
action, selection and the brand mark. Category cards carry drawn illustrations
until real photos exist. Urbanist for headings, Roboto Flex for reading, Lucide line
icons. A dark theme mirrors the structure and is one tap away in the header.

---

## 1. Principles

1. **The menu lands as a list of categories.** Large horizontal cards, one per
   category, each expanding inline to its items. Several can be open at once.
2. **Find it fast.** The search field is the most prominent control on the page;
   the bottom nav's Search tab focuses it from anywhere.
3. **Numbers align.** Prices use tabular figures, formatted to 2 decimals.
4. **The top of the menu is live state.** Open/closed (with a glowing teal dot), the
   wait, closing time and table sit under the shop name.
5. **Colour roles are fixed.** Teal = action, selection, icons and badges. Mint
   (highlight) = today's special, nothing else. Red = errors and destructive
   actions. The illustration palette never carries UI meaning.
6. **State is never colour alone.** Open cards flip the chevron, the current nav tab
   is semibold and `aria-current`, quick-add confirms with "Added" and a check,
   sold-out strikes through and labels itself.

---

## 2. Colour

### Teal

| Token | Hex | Use |
|---|---|---|
| `teal-600` | `#0D9488` | **Brand, light** — icons, the brand mark, rings, selected borders, focus, the open dot |
| `teal-700` | `#0F766E` | **Accent fill, light** — white on it is 5.5:1 |
| `teal-400` | `#2DD4BF` | **Brand and accent fill, dark** — its text is `#042F2E` (9.5:1) |
| `teal-300` | `#5EEAD4` | Hover and focus ring (dark) |
| `teal-100` | `#CCFBF1` | Highlight (light) — today's special |
| `#E3F1EE` | — | Subtle fill (light) — icon wells, illustration backdrop |

White on `#0D9488` is only 3.7:1, under the floor for normal text. So text-bearing
fills (`bg-accent` + `text-on-accent`) step to `#0F766E` with white in light and
carry near-black text in dark; the `brand` utilities (`text-brand`, `bg-brand`,
`border-brand`) are for marks only.

### Surfaces and text

| | Light (default) | Dark |
|---|---|---|
| Page | `#EEEBE5` greige + paper grain | `#0F1312` + grain |
| Card | `#FBFAF8` warm white + soft shadow | `#181D1B` + 1px border |
| Card, hovered | `#F6F4F0` | `#1E2421` |
| Bottom nav | `#FBFAF8` | `#141917` |
| Primary text | `#1F2421` charcoal | `#F6F4F0` |
| Secondary text | `#5E625F` (5.3:1 on the page) | `#B4B8B5` |
| Muted (disabled, placeholder) | `#9A9D9A` | `#6F736F` |

Red: `#B91C1C` (light) / `#FCA5A5` (dark).

### Illustration palette

`--illo-teal`, `--illo-teal-soft`, `--illo-cream`, `--illo-latte`, `--illo-coffee`,
`--illo-gold`, `--illo-leaf`, `--illo-leaf-dark`, `--illo-tomato`, `--illo-ink`, and
the theme-aware `--illo-backdrop`. Food and drink colours for the drawings in
`components/menu/category-illustration.tsx` only — never for buttons, text, state
or borders.

### Themes

- **Customer** — light by default. The header toggle switches to dark and saves the
  choice; the inline script in `app/layout.tsx` applies a saved "dark" before first
  paint. The toggle's icon shows the current mode (sun in light, moon in dark); its
  accessible name says what pressing it does.
- **Staff and kitchen** pin `data-theme="dark"` on their own root.

---

## 3. Type

- **Urbanist** (variable) — titles, section headings, item names, metrics.
  `font-display`; the `title`, `section`, `display`, `item` and `metric` roles pick it
  up automatically.
- **Roboto Flex** (variable, opsz) — everything else. `font-sans`, the body default.
  Optical size is driven by `font-optical-sizing: auto`; never use
  `font-variation-settings` — it silently disables that.

| Role | Face | Size / Line | Weight |
|---|---|---|---|
| `display` | Urbanist | 48 / 48 | 800 |
| `metric` | Urbanist | 40 / 40 | 800 |
| `title` | Urbanist | 30 / 36 | 800 |
| `section` | Urbanist | 22 / 28 | 800 |
| `item` | Urbanist | 18 / 24 | 700 |
| `body-lg` | Roboto Flex | 18 / 28 | 400 |
| `body` | Roboto Flex | 16 / 24 | 400 |
| `small` | Roboto Flex | 14 / 20 | 400 |
| `note` | Roboto Flex | 15 / 22 | 400 |
| `price` | Roboto Flex | 17 / 24 | 700 |
| `spec` | Roboto Flex | 12 / 16 | 500 |

All figures tabular. Sentence case throughout. No italic, no emoji.

**Icons:** Lucide (`lucide-react`), line style, `strokeWidth` 1.75 (2–2.25 for small
or active glyphs), `currentColor`, always `aria-hidden` with the label carried by
text or `aria-label`. Category glyphs live in `components/menu/category-icon.tsx`.
Lucide has no fries icon, so Sides uses `Popcorn`.

---

## 4. Shape, elevation and texture

| Token | Value | Applies to |
|---|---|---|
| `radius-control` | 14px | Buttons, inputs, icon wells, toasts |
| `radius-tile` | 20px | Cards (`surface-card`), photos, option rows |
| `radius-sheet` | 28px | Bottom sheets, the special card, the floating checkout |
| `radius-pill` | 999px | Tabs, tags, the search field, the stepper, round buttons |

- **`surface-card`** — the card: raised fill, radius-tile, `shadow-card` (soft,
  neutral, never teal). In dark the shadow barely shows, so a faint border
  (`--line-card`) carries the edge.
- **`shadow-float`** — the bottom nav, open sheets and the floating checkout.
- **Card border** — dark cards carry a faint 1px border (`--line-card`).
- **The page texture** — a faint paper grain from an inline SVG noise filter, on a
  fixed, inert layer behind everything (`.page-texture` in `app/layout.tsx`), at
  `--texture-opacity` (5% light, 7% dark). Never strong enough to affect contrast.

No gradient fills on buttons or cards.

---

## 5. Space & layout

4px base unit. Page gutter: 16px mobile, 24px at 640px and up, 32px at 1024px and
up. The menu is a single 640px column at every width — no two-column grids. 12px
between category tiles.

```
+------------------------------+
| [cup] Coffee Bar   (sun)(bag)|  teal mark, name, theme toggle, cart
|  * Open now · ~6 min wait    |  live status, glowing teal dot
| (  Search coffee, food...  ) |  search pill, 56px tall
| +-- Today's special -------+ |  mint card, only when staff set one
| +--------------------------+ |
| |[*]          |  drawing  | |  category card (closed):
| |Best Sellers v|  or photo | |  words left, art right
| +--------------------------+ |
| |Coffee      ^|  drawing  | |  category card (open)
| |  [img] Espresso          | |
| |        A double shot...  | |
| |        $25.00    [Add +] | |  item card
| +--------------------------+ |
| Home  Search  Orders Profile |  bottom nav
+------------------------------+
```

---

## 6. Motion

| Token | Value |
|---|---|
| `dur-fast` | 120ms |
| `dur-base` | 180ms |
| `dur-slow` | 260ms |
| `ease-standard` | `cubic-bezier(.2,0,0,1)` |
| `ease-exit` | `cubic-bezier(.4,0,1,1)` |

Motion answers actions. No scroll-triggered reveals, no card hover lifts, no page-load
stagger.

**The one orchestrated moment** is add-to-cart: the `[+]` shows a ring and holds
for 120ms, and the cart icon's count badge pops in on the bottom nav. Never animate
`font-weight` — it forces glyph re-rasterisation every frame and janks on mid-range
phones.

This only plays on a zero-option item (sides, bakery/desserts), where `[+]` really
does add straight to the cart. Anything with a choice to make — milk, sweetness, a
side — routes `[+]` to the item sheet instead, same destination as tapping the row;
the sheet's own **Add to order** is where the add (and this animation) actually
happens.

`prefers-reduced-motion: reduce` collapses all durations to 0.01ms and replaces the
badge pop with an instant value change.

**One further exception, by deliberate product decision:** the status strip's wait
figure (`state.waitMinutes`) may spring to a new value when it *changes* —
`components/ui/count-up.tsx`, adapted from React Bits' `CountUp`. This is scoped
narrowly and is not a general license to reach for React Bits (or any animation
library) elsewhere:

- It never plays on mount or on scroll — the number renders statically until the
  underlying value actually changes, the same "answers an action" test everything
  else in this section passes.
- It explicitly checks `prefers-reduced-motion` in JS (the CSS override above can't
  reach a JS-driven spring) and jumps instantly instead of animating.
- No other React Bits component is in use. Its catalog is mostly hover/scroll/
  decorative effects that this section rules out by name; this is the one component
  in it whose entire purpose — animate a number when it changes — mapped onto a
  real, already-modeled piece of state.

---

## 7. Components

Menu home is composed from `Header`, `MenuHero`, `SearchBar`, `CategoryAccordion`,
`MenuItemCard` and `BottomNav`.

- **Header** (`components/header.tsx`) — a teal cup mark on a soft teal tile,
  "Coffee Bar" (Urbanist), a status line (glowing teal dot, "Open now", wait,
  closing time, table) in lighter grey, the theme toggle and the cart button
  (charcoal icons on warm-white circles).
- **MenuHero** (`components/menu/menu-hero.tsx`) — a welcome card under the header:
  a wide photo (`public/menu/hero-coffee-beans.jpg`) above the headline "Good
  coffee, made to order" in the title style.
- **SearchBar** (`components/menu/search-bar.tsx`) — the most prominent field on
  the page: a 56px pill-shaped card, search icon, 18px text, a clear button once
  there's text; the focus ring is drawn on the pill. Matches name, description,
  tasting note and tags across the whole menu. While there's a query, today's
  special and the cards hide and matching items show grouped by category.
- **CategoryAccordion** (`components/menu/category-accordion.tsx`) — one large
  horizontal card per category, about 136px tall: on the left a teal icon well, the
  name in the section style and a chevron; on the right ~42% of the card is the category's photo, edge to edge, or
  — until there is one — its drawn illustration. Tapping expands the items inline:
  a 300ms 0fr→1fr grid-row transition; closed panels are `inert`. A real `<button>`
  inside an `<h2>` with `aria-expanded`. Categories with no items get no card.
- **CategoryIllustration** (`components/menu/category-illustration.tsx`) — flat
  drawings, one per category (star rosette, coffee cup, iced drink, noodle bowl,
  sandwich, salad bowl, fries, croissant and cake, sparkles for New, a cloche for
  staff-added categories), in the illustration palette on a soft teal disc. Also
  fills item thumbnails that have no photo.
- **MenuItemCard** (`components/menu/menu-item-card.tsx`) — 72px rounded thumbnail
  (photo, else the category illustration),
  name (Urbanist 700), tags, two-line description, spec line; the block opens the
  item sheet. Below: the price and a teal **Add +** pill. Items with options
  (or salads) open the sheet from the pill too; others add straight away and the
  pill reads **Added ✓** for a moment. Sold out / closed swap the pill for a
  disabled label.
- **BottomNav** (`components/bottom-nav.tsx`) — fixed, four equal tabs: Home,
  Search (focuses the search field), Orders, Profile. Icon over label; the current
  tab is accent-coloured, semibold and `aria-current`. Hidden on the cart, item,
  staff and kitchen routes.
- **Today's special** — mint card, the only highlight surface.
- **Button** — `primary` (accent fill), `secondary` (outlined), `ghost`,
  `destructive`. Labels name the outcome: **Add to order**, **Place order**.
- **Item sheet**, **Cart** (summary card + floating checkout), **Order tracking**
  (vertical step tracker) — unchanged in structure; they take the teal tokens.

---

## 8. Accessibility floor

- Body text at least 4.5:1, large text at least 3:1, in both themes. `muted` is
  excluded from body copy. White never sits on `#0D9488` as text — text-bearing
  fills use `bg-accent`.
- Minimum touch target 44x44; kiosk mode 56x56.
- Focus ring: 2px brand teal at 2px offset. Never override `outline` inline on a
  focusable element.
- Disabled is a fill swap, never an opacity drop.
- Sheets trap focus and restore it to the trigger on close.
- Prices read as currency via `aria-label`, not raw digits.
- Reduced motion respected globally.

---

## 9. Open decisions

These fork the requirements, so worth settling first:

1. **Payment** — Stripe card, mobile money, or pay-at-counter with the app as an order
   ticket only? Biggest scope fork by a distance.
2. **Kiosk** — shared in-store device in v1, or phone-only? Affects session handling
   and idle reset, not the tokens.
3. **Identity** — guest checkout only, or accounts with reorder and a stamp card?
4. **Multi-location** — one bar or several? Changes the data model at the root.
5. **Menu authoring** — who edits items and flips sold-out, and from what surface?
