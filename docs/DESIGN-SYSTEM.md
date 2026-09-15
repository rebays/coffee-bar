# Coffee Bar Menu — Design System v0.4

Target: mobile-first ordering on the customer's own phone (QR at table / counter),
with a kiosk density mode reusing the same tokens. Next.js App Router + Tailwind v4.

**Changed from v0.3:** typeface is Bricolage Grotesque. Palette unchanged.
Two knock-on changes, both in §3: the italic treatment is gone (Bricolage ships
upright only) and width is now used to *condense* metadata rather than emphasise
headings.

---

## 1. Direction

**Name:** *Steel & Steam.*

Three colours, three jobs, no overlap:

- **Black** is structure. Chrome, text, the status strip, the cart bar. Anything that
  frames the content rather than being content.
- **Cyan** is action, and nothing else. Buttons, selected state, the live order dot,
  focus rings. If it's cyan, you can press it or it's happening right now.
- **White** is the page.

That split is the whole system. A three-colour palette only stays legible if each
colour means one thing, so the discipline is: **black never means "press me" and cyan
never means "read me."**

Three commitments that drive everything downstream:

1. **The menu is a list, not a photo grid.** Someone standing in a queue scans names
   and prices. A grid of identical photo cards fits six items where a list fits twelve,
   and prices stop aligning. Photos move into the item sheet.
2. **Numbers align.** Prices, shot counts, volumes and caffeine all sit on tabular
   figures on a fixed right rail. This is the one place the design borrows directly
   from brew logs and cupping forms.
3. **The hero is live state, not a picture.** Today's filter coffee, current wait,
   open/closed. That's the most useful thing a bar can tell you before you order.

**Geometry encodes hierarchy.** Surfaces are square. Tiles get a 3px radius. Text
inputs get a sleeker 10px — enough to read as "type here," distinct from a card you'd
merely tap. Anything you press is fully round. A pill means "this is an object you
touch"; a square edge means "this is the page." One radius on everything erases that
signal.

The staff surface (dashboard, kitchen display, sign-in) is the one deliberate,
scoped exception: `[data-surface="staff"]` steps `radius-tile` up to 14px and
`radius-input` to 12px. That crispness rule above is about a countertop display
read at a glance; the back office is a desktop admin screen with none of that
constraint, so it trades it for a rounder, more modern card language. Nothing here
changes the customer-facing token values.

Black is real black — `#000000`, not a tinted near-black. With a cyan accent, a warmed
or cooled black muddies the relationship; true black keeps cyan reading as the only
colour in the room, and it's the right ground for an OLED phone or a wall board.

---

## 2. Colour

### Slate — neutral ramp, untinted

| Token | Hex | Use |
|---|---|---|
| `slate-0` | `#FFFFFF` | **Page ground (light)**, surfaces; primary text in dark |
| `slate-50` | `#F6F6F6` | Sunken fills, inputs, hover |
| `slate-100` | `#EDEDED` | Tag fill, skeleton |
| `slate-200` | `#DCDCDC` | **Hairlines**, dividers, input borders |
| `slate-300` | `#BFBFBF` | Disabled border; secondary text in dark mode |
| `slate-400` | `#9A9A9A` | Sold-out text, placeholder (2.8:1 — never body copy) |
| `slate-500` | `#767676` | Tertiary text (4.5:1 on white — the floor, exactly) |
| `slate-600` | `#5A5A5A` | **Secondary text** (7.0:1 on white) |
| `slate-700` | `#404040` | — |
| `slate-800` | `#262626` | Hairlines in dark mode |
| `slate-900` | `#141414` | Raised surface in dark mode |
| `slate-950` | `#0A0A0A` | Sunken surface in dark mode |
| `black` | `#000000` | **Structure** — text, cart bar, status strip, dark ground |

### Cyan — action, and only action

| Token | Hex | Use |
|---|---|---|
| `cyan-50` | `#E4F8FC` | Subtle fill (light) |
| `cyan-100` | `#BFEFF8` | Subtle border (light); text on subtle (dark) |
| `cyan-200` | `#8AE1F2` | Hover on dark |
| `cyan-300` | `#45CFE9` | **Accent (dark mode)** — 10.6:1 on black, takes black text |
| `cyan-400` | `#12B5D4` | Pressed on dark |
| `cyan-500` | `#0093B0` | Hover on light |
| `cyan-600` | `#006C84` | **Accent (light mode)** — 6.1:1 on white, takes white text |
| `cyan-700` | `#045D72` | Pressed on light |
| `cyan-900` | `#0A3A46` | Subtle fill (dark); text on `cyan-50` |

**Never** put `cyan-200`–`cyan-400` on white, or `cyan-600`–`cyan-900` on black. Those
pairings fall below 3:1 and are the one way this palette breaks. Worth a lint rule.

### Signal — semantic only

| Token | Hex | Use |
|---|---|---|
| `signal-500` | `#C7261A` | Destructive fill |
| `signal-700` | `#A81F14` | Error text (7.3:1 on white) |
| `signal-50` | `#FCEBE9` | Error field background |

Reserved for destructive actions and validation errors. Sold-out is **not** signal —
it's `slate-400` plus a strikethrough on the price.

### Green — a fourth colour, by deliberate exception

| Token | Hex | Use |
|---|---|---|
| `green-50` | `#E6F7EC` | Subtle fill (light) |
| `green-100` | `#C3EFD2` | Subtle border (light) |
| `green-300` | `#4ADE80` | **Success (dark mode)** — 12.1:1 on black, takes black text |
| `green-600` | `#0F7A3C` | **Success (light mode)** — 5.4:1 on white, takes white text |
| `green-800` | `#166534` | Text on `green-50` |
| `green-900` | `#0F3D1F` | Subtle fill (dark) |

The direction's whole premise is "three colours, three jobs" — this is the one
place that's no longer true, added by explicit product decision for exactly one
job: **the store open/closed status badge**, nowhere else. It follows cyan's own
two-stop shape (a light-mode stop checked against white, a dark-mode stop checked
against black) rather than inventing a new method. Closed reuses `signal` as-is —
no new red was needed, only green. Never reach for green for anything else; if
another feature seems to want it, that's a new instance of the same question
CLAUDE.md already asks about a fourth colour, not a precedent this one answers.

The open badge alone also breaks the "no coloured shadows" rule in §5, with a soft
`color-mix(in srgb, var(--success) 45%, transparent)` glow — again scoped to that
one badge via `.shadow-glow-open`, not a general elevation option.

### The two themes

| | Light | Dark |
|---|---|---|
| Ground | `#FFFFFF` | `#000000` |
| Raised | `#FFFFFF` | `#141414` |
| Primary text | `#000000` | `#FFFFFF` |
| Secondary text | `#5A5A5A` | `#BFBFBF` |
| Hairline | `#DCDCDC` | `#262626` |
| Structure fill | `#000000` | `#141414` |
| Accent fill | `#006C84` | `#45CFE9` |
| Text on accent | `#FFFFFF` | `#000000` |

---

## 3. Type

**Bricolage Grotesque Variable** — `opsz 12–96`, `wdth 75–100`, `wght 200–800`.

```
next/font/google:
  Bricolage_Grotesque({
    subsets: ['latin'],
    axes: ['opsz', 'wdth'],   // wght is the default axis, don't list it
    variable: '--font-bricolage',
  })
```

### Set the axes through standard CSS properties, not `font-variation-settings`

This is the one implementation detail that matters. Use:

- `font-weight` for wght
- `font-stretch` as a **percentage** (75%–100%) for wdth
- `font-optical-sizing: auto` for opsz

Reaching for `font-variation-settings` instead is the common mistake: it takes a lower-
level path that suppresses automatic optical sizing in several engines, so you silently
lose the opsz axis — the main reason this face was chosen. The rule is: only use
`font-variation-settings` for axes with no CSS property of their own. Bricolage has
none of those.

### Width goes down, never up

The width axis tops out at 100, so it can only condense. That's the correct direction
anyway: **condense metadata to fit, never expand headings to emphasise.** Item names
sit at the full 100%; only the 12px spec line condenses, to 90%, which buys roughly two
extra characters per line for shot counts and ratios.

### Scale

| Role | Size / Line | Weight | Width | Tracking | Figures |
|---|---|---|---|---|---|
| `display` | 56 / 56 | 700 | 100% | −0.025em | — |
| `metric` | 44 / 44 | 700 | 100% | −0.02em | tabular |
| `title` | 32 / 36 | 700 | 100% | −0.02em | — |
| `section` | 24 / 28 | 600 | 100% | −0.015em | — |
| `item` | 20 / 26 | 600 | 100% | −0.01em | — |
| `body-lg` | 18 / 28 | 400 | 100% | 0 | — |
| `body` | 16 / 24 | 400 | 100% | 0 | — |
| `small` | 14 / 20 | 400 | 100% | 0 | — |
| `note` | 15 / 22 | 350 | 100% | +0.01em | — |
| `price` | 18 / 24 | 600 | 100% | 0 | tabular |
| `spec` | 12 / 16 | 500 | 90% | +0.02em | tabular |

Tracking is slightly tighter than a neutral grotesque would want, because Bricolage
sets a little loose by default at display sizes.

### Tasting notes — replaces the italic treatment

Bricolage ships upright only; there is no italic. So tasting notes ("Blackcurrant,
brown sugar, clean finish") are now the `note` role: **weight 350, +0.01em tracking,
secondary colour.** It's the only text in the system below weight 400, which makes it
as distinct as the italic was, and it does not depend on colour alone.

Because 350 is below the usual body floor, `note` is capped at 15px and is never used
for anything a customer has to act on — descriptive text only.

### Rules

- Every numeral uses `font-variant-numeric: tabular-nums`. Prices in a column are
  unreadable with proportional figures.
- Item name at 600 against description at 400 is the whole hierarchy inside a row.
  Don't add colour or size to reinforce it — colour is spoken for.
- Sentence case throughout. No all-caps labels, including tags and section headers —
  except the standard dietary abbreviations **V / VG / GF**, which read as acronyms
  everyone already recognises from menus generally, not as emphasis-via-shouting.
- Body copy is written to read compactly, but the real enforcement is the list row's
  2-line clamp, not a fixed character count — a longer description is still fine; it
  clamps in the list and shows in full in the item sheet.
- Weight 200 and 800 are available but unused. If a future need appears, 800 goes to
  the wall-board display size and nothing else.

---

## 4. Space & layout

4px base unit. Scale: `2 4 6 8 12 16 20 24 32 40 48 64 80`.

Page gutter: 16px mobile, 24px ≥640px, 32px ≥1024px. Menu column caps at 640px; cart
and checkout cap at 520px.

### Menu row — the primary pattern

```
┌────────────────────────────────────────────────────────┐
│ Flat white                                 $6.50   [+] │  ← name @600 / fixed price rail
│ Double ristretto, silky microfoam                      │  ← description @400, slate-600
│ 2 shots · 180ml · whole milk                           │  ← spec line, 12px @90% tabular
├────────────────────────────────────────────────────────┤  ← 1px slate-200
│ ▮▯▯  Filter — Kenya Kiambu                 $7.00   [+] │
│ Blackcurrant, brown sugar, clean finish                │  ← tasting note @350
│ V60 · 250ml · 1:16                                     │
└────────────────────────────────────────────────────────┘
   ↑                                          ↑       ↑
 roast bar                             72px rail   36px, fills
 (origin items only)                  right-aligned  cyan on press
```

Left-aligned throughout. The 72px price rail is fixed so prices align down the list
regardless of name length. Rows are 44px minimum, typically ~88px.

### Screen skeleton

```
┌──────────────────────────────┐
│  Open until 4pm · ~6 min     │  status strip, 34px, black, sticky
├──────────────────────────────┤
│  On filter today             │  live hero — cyan marker
│  Kenya Kiambu                │  title @700
│  Blackcurrant, brown sugar   │  tasting note @350
├──────────────────────────────┤
│ (Espresso)(Filter)(Cold)(Food)│ category rail, sticky, h-scroll
├──────────────────────────────┤
│  menu rows …                 │  scroll body
├──────────────────────────────┤
│  3 items          $19.50  ›  │  cart bar, black, floats, only when >0
└──────────────────────────────┘
```

The cart bar is black, not cyan: it's chrome that reports state. The cyan CTA lives
inside the cart screen it opens (**Pay $19.50**). One cyan action visible at a time.

---

## 5. Geometry & elevation

| Token | Value | Applies to |
|---|---|---|
| `radius-tile` | 3px (14px on the staff surface) | Cards, images |
| `radius-input` | 10px (12px on the staff surface) | Text inputs, textareas, search fields |
| `radius-sheet` | 16px 16px 0 0 | Bottom sheets only |
| `radius-pill` | 999px | Buttons, tags, option chips, stepper |
| `radius-none` | 0 | Page surfaces, dividers, status strip, cart bar |

`radius-input` sits between `radius-tile` and `radius-pill` on purpose: a text
field isn't a pressable object (so not a pill), but it isn't a static card or
image either — 3px reads as an oversight once you're typing into it, not a
choice. Never apply `radius-input` to anything but an actual `<input>` or
`<textarea>`; a card that merely contains a form still uses `radius-tile`.

Two elevations, neutral:

- `shadow-raise` — `0 1px 2px rgb(0 0 0 / .08)`
- `shadow-float` — `0 -2px 16px rgb(0 0 0 / .16)` — cart bar and open sheets only.

Everything else separates with a `1px slate-200` hairline. No cyan glows — a coloured
shadow would make cyan mean "decoration" as well as "action." The one exception is
`.shadow-glow-open`, a green glow on the Home screen's open-store badge only — see
§2's green ramp for why that badge gets to break both this rule and the palette.

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

**The one orchestrated moment** is add-to-cart: the `[+]` fills cyan and holds for
120ms, the cart bar count increments with a 180ms upward number swap, and the bar
slides up from below if this is the first item. Never animate `font-stretch` or
`font-weight` — variable-axis animation forces glyph re-rasterisation every frame and
janks on mid-range phones.

This only plays on a zero-option item (sides, bakery/desserts), where `[+]` really
does add straight to the cart. Anything with a choice to make — milk, sweetness, a
side — routes `[+]` to the item sheet instead, same destination as tapping the row;
the sheet's own **Add to order** is where the add (and this animation) actually
happens.

`prefers-reduced-motion: reduce` collapses all durations to 0.01ms and replaces the
count swap with an instant value change.

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

A second, equally narrow use: the bottom nav's floating centre "Menu" circle
(`components/bottom-nav.tsx`) fires a small spark burst from the tap point on click —
`components/ui/click-spark.tsx`, adapted from React Bits' `ClickSpark`. This passes
the same test as the exception above: it only exists in response to the click itself
(no hover, no idle animation — upstream's render loop is rewritten to stop once the
canvas is empty rather than run forever), and it explicitly skips under
`prefers-reduced-motion`.

**A third exception, and a different kind of one:** that same circle also carries a
slow, low-amplitude breathing loop (`animate-menu-pulse` in `app/globals.css`) — a
scale between 100% and 104.5% and a matching opacity dip, on a 2.6s cycle. Unlike the
two above, this one is genuinely idle, not event-triggered — it's the one deliberate
concession in the system to "this button is how you get back to ordering from
anywhere," an ambient cue rather than a response to anything the customer did. It's
kept from becoming a precedent for idle motion generally by staying small on every
axis that matters: one element, not a pattern; no colour (scale/opacity only, never
the coloured glow §5 reserves for the open-store badge); and it still collapses to a
single near-instant pass under `prefers-reduced-motion` via the global override above
— nothing extra to wire up, since a CSS `animation`, unlike CountUp's spring, is
already covered by it. If a future feature wants its own idle loop, that's a new
instance of this same question, not something this one answers by precedent.

---

## 7. Components

### Button

| Variant | Fill | Text | Border |
|---|---|---|---|
| `primary` | `cyan-600` (light) / `cyan-300` (dark) | white / black | none |
| `secondary` | transparent | primary text | 1px `slate-200` |
| `ghost` | transparent | accent | none |
| `destructive` | `signal-500` | `#FFFFFF` | none |

Sizes: `sm` 36px / `md` 44px / `lg` 52px / `kiosk` 56px. All `radius-pill`, horizontal
padding = height × 0.45. Disabled: `slate-100` fill, `slate-400` text — no opacity
tricks, which drop contrast below the floor.

Labels name the outcome: **Add to order**, **Pay $19.50**, **Cancel order**. The button
that says *Add to order* produces a toast that says *Added to order*.

### Option chip (size, milk, extras)

Pill, 40px, transparent with `slate-200` border. Selected: accent fill with inverted
text. A filled chip and a filled button mean the same thing, so selection needs no
separate treatment. Price deltas render inline: `Oat +$0.80`.

### Quantity stepper

Pill container, 40px, `slate-200` border. Minus / value / plus at 40×40 each. Value uses
tabular figures so the pill doesn't resize between 1 and 8. Minus becomes a remove
affordance at quantity 1.

### Tag

Pill, 24px, `spec` role (12px at 90% width), `slate-100` fill / `slate-600` text.
Dietary tags get the same neutral treatment — tags are metadata, and they're never cyan
because you can't press them. Exceptions: `Sold out` is `slate-400` text on transparent
with a hairline; `New` is black fill with white text.

### Cart bar

Fixed bottom, 64px + safe-area inset, black fill, white text, `shadow-float`, square
top edge. Renders only when the cart has items. Left: item count. Right: total in
tabular figures, then the forward affordance. The whole bar is one tap target.

### Item sheet

Bottom sheet, `radius-sheet`, max height 88vh. Order: image (16:9, 3px radius) → name →
description → tasting note (origin items) → option groups → notes field → sticky footer
with stepper and **Add to order · $6.50**. A real route (`/item/[slug]`) so back closes
it and links are shareable.

### Order status

Four states: **Sent** → **Making** → **Ready** → **Collected**. The active step fills
accent with inverted text — cyan's "happening right now" job. This is a stepped
sequence, so numbered markers are appropriate here, and only here.

### Empty & failure states

- Empty cart: "Nothing in your order yet." + **Browse the menu**.
- Sold out: item stays visible, price struck through, `[+]` disabled, `Sold out` tag.
  Hiding items makes regulars think the menu changed.
- Payment failure: "Card was declined. Try another card or pay at the counter." State
  what happened and what to do. No apology.
- Closed: menu browsable, `[+]` disabled, strip reads "Closed · opens 6:30am".

### Skeletons

`slate-100` blocks at `radius-tile`, no shimmer. Shape matches the menu row exactly.

---

## 8. Accessibility floor

- Body text ≥ 4.5:1, large text ≥ 3:1. All pairings pre-checked; `slate-400` is
  explicitly excluded from body copy.
- The cyan two-stop rule is a hard constraint: light stops on white, dark stops on
  black, never crossed.
- The `note` role at weight 350 is capped at 15px and never carries an action, since
  thin weights lose effective contrast at small sizes even when the hex passes.
- Minimum touch target 44×44 with 8px spacing; kiosk mode 56×56.
- Focus ring: `2px` accent at `2px` offset. The ring is cyan and cyan already means
  interactive, so focus reads correctly on both grounds.
- State is never colour alone — selected chips fill and gain weight, sold-out strikes
  through, the live step carries a text label, roast is a segment count.
- Sheets trap focus and restore it to the trigger on close.
- Prices read as currency via `aria-label`, not raw digits.
- Reduced motion respected globally.

---

## 9. Font loading

One variable file covers the whole scale, so there is one request. Two things to keep:

- `display: 'swap'` via `next/font` default, with the system fallback metric-matched by
  `next/font`'s automatic `size-adjust`. Bricolage has a large x-height, so an
  unadjusted fallback causes a visible reflow in the menu list.
- Subset to `latin` only unless the shop's menu needs otherwise. Prices and spec lines
  are the only content guaranteed to be non-translatable.

---

## 10. Open decisions

These fork the requirements, so worth settling first:

1. **Payment** — Stripe card, mobile money, or pay-at-counter with the app as an order
   ticket only? Biggest scope fork by a distance.
2. **Kiosk** — shared in-store device in v1, or phone-only? Affects session handling
   and idle reset, not the tokens.
3. **Identity** — guest checkout only, or accounts with reorder and a stamp card?
4. **Multi-location** — one bar or several? Changes the data model at the root.
5. **Menu authoring** — who edits items and flips sold-out, and from what surface?
