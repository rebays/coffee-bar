import type { ReactNode } from 'react'

import type { Category } from '@/lib/types'

/**
 * Flat, drawn illustrations — one per category — that stand in wherever a
 * real photo doesn't exist yet: the category cards, and item thumbnails
 * without a photo. Colours come from the `--illo-*` tokens in
 * app/globals.css, an illustration-only palette (food and drink colours
 * plus the brand teal) that never carries UI meaning. Each drawing sits on
 * a soft teal disc so they read as one set.
 *
 * All decorative: `aria-hidden`, labelled by the text beside them.
 */

const INK = 'var(--illo-ink)'
const STROKE = { stroke: INK, strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Backdrop() {
  return (
    <>
      <circle cx="80" cy="64" r="46" fill="var(--illo-teal-soft)" opacity="0.45" />
      <circle cx="132" cy="24" r="3" fill="var(--illo-gold)" />
      <circle cx="26" cy="34" r="2.5" fill="var(--illo-teal)" />
      <circle cx="140" cy="94" r="2" fill="var(--illo-teal)" />
    </>
  )
}

function Coffee() {
  return (
    <>
      <ellipse cx="78" cy="100" rx="46" ry="8" fill="var(--illo-cream)" {...STROKE} />
      <path d="M48 50h60v22a28 28 0 0 1-28 26h-4a28 28 0 0 1-28-26z" fill="var(--illo-teal)" {...STROKE} />
      <path d="M108 58h6a11 11 0 0 1 0 22h-9" fill="none" {...STROKE} strokeWidth={5} stroke="var(--illo-teal)" />
      <ellipse cx="78" cy="50" rx="30" ry="7" fill="var(--illo-coffee)" {...STROKE} />
      <path d="M72 49c2-3 6-3 6 0 0-3 4-3 6 0-1 3-6 5-6 5s-5-2-6-5z" fill="var(--illo-cream)" />
      <path d="M66 36c-4-5 4-8 0-14M80 34c-4-5 4-8 0-14M94 36c-4-5 4-8 0-14" fill="none" stroke="var(--illo-teal)" strokeWidth={3} strokeLinecap="round" opacity="0.7" />
    </>
  )
}

function IcedDrink() {
  return (
    <>
      <path d="M90 14l-8 60" stroke="var(--illo-teal)" strokeWidth={5} strokeLinecap="round" />
      <path d="M56 32h48l-7 70a6 6 0 0 1-6 5H69a6 6 0 0 1-6-5z" fill="var(--illo-cream)" {...STROKE} />
      <path d="M59 52h42l-5 50a5 5 0 0 1-5 4H69a5 5 0 0 1-5-4z" fill="var(--illo-tomato)" opacity="0.85" />
      <rect x="66" y="58" width="13" height="13" rx="3" fill="var(--illo-cream)" opacity="0.75" transform="rotate(-10 72 64)" />
      <rect x="80" y="68" width="12" height="12" rx="3" fill="var(--illo-cream)" opacity="0.65" transform="rotate(12 86 74)" />
      <path d="M56 32h48l-7 70a6 6 0 0 1-6 5H69a6 6 0 0 1-6-5z" fill="none" {...STROKE} />
      <circle cx="106" cy="34" r="13" fill="var(--illo-gold)" {...STROKE} />
      <path d="M106 24v20M96 34h20M99 27l14 14M113 27 99 41" stroke="var(--illo-cream)" strokeWidth={1.5} />
    </>
  )
}

function Star() {
  return (
    <>
      <circle cx="80" cy="62" r="32" fill="var(--illo-teal)" {...STROKE} />
      <path
        d="M80 40l6.5 13.4 14.8 2.1-10.7 10.4 2.5 14.7L80 73.7 66.9 80.6l2.5-14.7-10.7-10.4 14.8-2.1z"
        fill="var(--illo-gold)"
        {...STROKE}
      />
      <path d="M62 92l-6 18 10-5 6 9 4-18M98 92l6 18-10-5-6 9-4-18" fill="var(--illo-tomato)" {...STROKE} />
      <path d="M124 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM34 78l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="var(--illo-gold)" />
    </>
  )
}

function Bowl() {
  return (
    <>
      <path d="M104 22 84 58M114 26 92 60" stroke="var(--illo-coffee)" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx="80" cy="64" rx="38" ry="10" fill="var(--illo-gold)" {...STROKE} />
      <path d="M54 58c4-8 14-10 20-4M80 56c6-8 16-6 18 2" fill="none" stroke="var(--illo-tomato)" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx="66" cy="62" rx="6" ry="3" fill="var(--illo-leaf)" transform="rotate(-20 66 62)" />
      <ellipse cx="96" cy="63" rx="6" ry="3" fill="var(--illo-leaf)" transform="rotate(25 96 63)" />
      <path d="M40 66h80a40 34 0 0 1-80 0z" fill="var(--illo-teal)" {...STROKE} />
      <path d="M50 76h60" stroke="var(--illo-cream)" strokeWidth={2.5} strokeLinecap="round" opacity="0.6" />
      <ellipse cx="80" cy="103" rx="22" ry="4" fill="var(--illo-teal)" {...STROKE} />
    </>
  )
}

function Sandwich() {
  return (
    <>
      <path d="M40 92h80a6 6 0 0 1-6 10H46a6 6 0 0 1-6-10z" fill="var(--illo-latte)" {...STROKE} />
      <path d="M42 84h76v8H42z" fill="var(--illo-tomato)" {...STROKE} />
      <path d="M44 78l8 12 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-12z" fill="var(--illo-gold)" {...STROKE} />
      <path d="M38 76c6-6 10 2 16-4s10 2 16-4 10 2 16-4 10 2 16-4 10 2 14-2v8H38z" fill="var(--illo-leaf)" {...STROKE} />
      <path d="M40 74c0-22 18-36 40-36s40 14 40 36z" fill="var(--illo-latte)" {...STROKE} />
      <path d="M62 52l3 2M78 46l3 1M94 52l3 2M70 60l3 1M88 60l3 1" stroke="var(--illo-cream)" strokeWidth={2.5} strokeLinecap="round" />
    </>
  )
}

function Salad() {
  return (
    <>
      <ellipse cx="62" cy="54" rx="14" ry="8" fill="var(--illo-leaf)" {...STROKE} transform="rotate(-25 62 54)" />
      <ellipse cx="98" cy="54" rx="14" ry="8" fill="var(--illo-leaf)" {...STROKE} transform="rotate(25 98 54)" />
      <ellipse cx="80" cy="48" rx="14" ry="9" fill="var(--illo-leaf-dark)" {...STROKE} />
      <circle cx="70" cy="60" r="7" fill="var(--illo-tomato)" {...STROKE} />
      <circle cx="92" cy="61" r="6" fill="var(--illo-tomato)" {...STROKE} />
      <circle cx="82" cy="62" r="5" fill="var(--illo-cream)" {...STROKE} />
      <path d="M38 64h84a42 36 0 0 1-84 0z" fill="var(--illo-cream)" {...STROKE} />
      <path d="M44 72h72" stroke="var(--illo-teal)" strokeWidth={5} strokeLinecap="round" />
      <ellipse cx="80" cy="103" rx="20" ry="4" fill="var(--illo-cream)" {...STROKE} />
    </>
  )
}

function Fries() {
  return (
    <>
      {[52, 60, 68, 76, 84, 92, 100].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={22 + (i % 3) * 6}
          width="7"
          height="44"
          rx="2"
          fill="var(--illo-gold)"
          {...STROKE}
          transform={`rotate(${(i - 3) * 4} ${x + 3} 60)`}
        />
      ))}
      <path d="M46 56h68l-8 48H54z" fill="var(--illo-teal)" {...STROKE} />
      <path d="M52 66h56" stroke="var(--illo-cream)" strokeWidth={4} strokeLinecap="round" />
      <path d="M118 84h22l-3 18h-16z" fill="var(--illo-cream)" {...STROKE} />
      <ellipse cx="129" cy="84" rx="11" ry="4" fill="var(--illo-tomato)" {...STROKE} />
    </>
  )
}

function Bakery() {
  return (
    <>
      <path d="M96 98l18-36 18 36z" fill="var(--illo-cream)" {...STROKE} />
      <path d="M100 90h28M104 82h20" stroke="var(--illo-tomato)" strokeWidth={3} />
      <circle cx="114" cy="58" r="6" fill="var(--illo-tomato)" {...STROKE} />
      <path d="M28 90c4-18 18-30 34-32 14 0 26 10 30 22-6 8-18 14-32 14-14 0-26-2-32-4z" fill="var(--illo-gold)" {...STROKE} />
      <path d="M44 68c4 8 4 18 2 26M60 60c3 10 3 22 0 34M76 64c-1 10-3 20-8 28" fill="none" {...STROKE} />
      <path d="M36 80c4-2 8-2 10 2M84 74c-4 0-8 2-10 6" fill="none" stroke="var(--illo-cream)" strokeWidth={2.5} strokeLinecap="round" />
      <ellipse cx="80" cy="104" rx="56" ry="5" fill="var(--illo-teal)" opacity="0.35" />
    </>
  )
}

function Sparkles() {
  return (
    <>
      <path d="M78 26l7 22 22 7-22 7-7 22-7-22-22-7 22-7z" fill="var(--illo-teal)" {...STROKE} />
      <path d="M116 66l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="var(--illo-gold)" {...STROKE} />
      <path d="M44 72l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="var(--illo-tomato)" {...STROKE} />
    </>
  )
}

function Cloche() {
  return (
    <>
      <path d="M40 88a40 40 0 0 1 80 0z" fill="var(--illo-teal)" {...STROKE} />
      <path d="M54 76a28 28 0 0 1 20-20" fill="none" stroke="var(--illo-cream)" strokeWidth={3} strokeLinecap="round" opacity="0.7" />
      <circle cx="80" cy="44" r="5" fill="var(--illo-gold)" {...STROKE} />
      <path d="M30 90h100" {...STROKE} strokeWidth={4} />
      <ellipse cx="80" cy="100" rx="44" ry="5" fill="var(--illo-cream)" {...STROKE} />
    </>
  )
}

const DRAWINGS: Record<string, () => ReactNode> = {
  __new: Sparkles, // the "New" shortcut group in components/menu/menu-body.tsx
  'best-sellers': Star,
  coffee: Coffee,
  'tea-refreshers': IcedDrink,
  mains: Bowl,
  sandwich: Sandwich,
  salad: Salad,
  sides: Fries,
  'bakery-desserts': Bakery,
}

/**
 * A category's illustration, filling its box (viewBox 160 × 120). `fit`
 * "cover" crops to fill a wide card panel; "contain" keeps the whole
 * drawing for square thumbnails. Staff-added categories get a cloche.
 */
export function CategoryIllustration({
  category,
  fit = 'cover',
  className = '',
}: {
  category: Category
  fit?: 'cover' | 'contain'
  className?: string
}) {
  const Drawing = DRAWINGS[category] ?? Cloche
  return (
    <svg
      viewBox="0 0 160 120"
      preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
      aria-hidden="true"
      className={['block h-full w-full', className].join(' ')}
      style={{ backgroundColor: 'var(--illo-backdrop)' }}
    >
      <Backdrop />
      <Drawing />
    </svg>
  )
}
