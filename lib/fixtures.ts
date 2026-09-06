import type { MenuItem, OptionGroup } from './types.ts'

/**
 * Menu fixtures for a specialty bar in Honiara.
 *
 * Prices are real SBD, not the illustrative `$6.50` the design doc uses to
 * draw a row — a flat white in Honiara is around SBD 38, and the price rail
 * has to hold that width. All amounts are integer minor units.
 */

export const OPTION_GROUPS: Record<string, OptionGroup> = {
  size: {
    id: 'size',
    label: 'Size',
    required: true,
    defaultChoiceId: 'regular',
    choices: [
      { id: 'regular', label: 'Regular', priceDelta: 0 },
      { id: 'large', label: 'Large', priceDelta: 900 },
    ],
  },
  milk: {
    id: 'milk',
    label: 'Milk',
    required: true,
    defaultChoiceId: 'whole',
    choices: [
      { id: 'whole', label: 'Whole', priceDelta: 0 },
      { id: 'skim', label: 'Skim', priceDelta: 0 },
      { id: 'oat', label: 'Oat', priceDelta: 800 },
      { id: 'soy', label: 'Soy', priceDelta: 500 },
      { id: 'coconut', label: 'Coconut', priceDelta: 500 },
    ],
  },
  shots: {
    id: 'shots',
    label: 'Extra shot',
    required: true,
    defaultChoiceId: 'none',
    choices: [
      { id: 'none', label: 'None', priceDelta: 0 },
      { id: 'one', label: 'One', priceDelta: 700 },
      { id: 'two', label: 'Two', priceDelta: 1400 },
    ],
  },
  ice: {
    id: 'ice',
    label: 'Ice',
    required: true,
    defaultChoiceId: 'regular-ice',
    choices: [
      { id: 'regular-ice', label: 'Regular', priceDelta: 0 },
      { id: 'light-ice', label: 'Light', priceDelta: 0 },
      { id: 'no-ice', label: 'None', priceDelta: 0 },
    ],
  },
  sweetness: {
    id: 'sweetness',
    label: 'Sweetness',
    required: true,
    defaultChoiceId: 'unsweetened',
    choices: [
      { id: 'unsweetened', label: 'Unsweetened', priceDelta: 0 },
      { id: 'half', label: 'Half sweet', priceDelta: 0 },
      { id: 'sweet', label: 'Sweet', priceDelta: 0 },
    ],
  },
  served: {
    id: 'served',
    label: 'Served',
    required: true,
    defaultChoiceId: 'as-it-comes',
    choices: [
      { id: 'as-it-comes', label: 'As it comes', priceDelta: 0 },
      { id: 'toasted', label: 'Toasted', priceDelta: 0 },
      { id: 'toasted-butter', label: 'Toasted with butter', priceDelta: 500 },
    ],
  },
}

export const MENU: MenuItem[] = [
  // Espresso ---------------------------------------------------------------
  {
    slug: 'flat-white',
    name: 'Flat white',
    description: 'Double ristretto under silky microfoam.',
    spec: '2 shots · 180ml · whole milk',
    basePrice: 3800,
    category: 'espresso',
    tags: ['Contains dairy'],
    optionGroupIds: ['size', 'milk', 'shots'],
  },
  {
    slug: 'long-black',
    name: 'Long black',
    description: 'Two shots poured over hot water, crema intact.',
    spec: '2 shots · 160ml · no milk',
    basePrice: 3400,
    category: 'espresso',
    tags: ['Dairy free'],
    optionGroupIds: ['size', 'shots'],
  },
  {
    slug: 'piccolo',
    name: 'Piccolo',
    description: 'One ristretto, a thumb of milk, gone in four sips.',
    spec: '1 shot · 90ml · whole milk',
    basePrice: 3200,
    category: 'espresso',
    tags: ['Contains dairy'],
    optionGroupIds: ['milk', 'shots'],
  },
  {
    slug: 'short-black',
    name: 'Short black',
    description: 'A single shot, pulled to order.',
    spec: '1 shot · 30ml · no milk',
    basePrice: 2800,
    category: 'espresso',
    tags: ['Dairy free'],
    optionGroupIds: ['shots'],
  },

  // Filter -----------------------------------------------------------------
  {
    slug: 'filter-kenya-kiambu',
    name: 'Filter — Kenya Kiambu',
    description: 'Washed SL28, poured by hand.',
    tastingNote: 'Blackcurrant, brown sugar, clean finish',
    roast: 'light',
    spec: 'V60 · 250ml · 1:16',
    basePrice: 4800,
    category: 'filter',
    tags: ['Dairy free'],
    optionGroupIds: [],
  },
  {
    slug: 'filter-guadalcanal',
    name: 'Filter — Guadalcanal',
    description: 'Grown up on the Weather Coast, roasted here.',
    tastingNote: 'Cocoa, ripe banana, soft citrus',
    roast: 'medium',
    spec: 'V60 · 250ml · 1:16',
    basePrice: 4500,
    category: 'filter',
    tags: ['Dairy free', 'Local'],
    optionGroupIds: [],
  },
  {
    slug: 'filter-png-sigri',
    name: 'Filter — PNG Sigri',
    description: 'Estate lot from the Wahgi Valley.',
    tastingNote: 'Toffee, red apple, black tea',
    roast: 'medium',
    spec: 'V60 · 250ml · 1:16',
    basePrice: 4800,
    category: 'filter',
    tags: ['Dairy free'],
    optionGroupIds: [],
    soldOut: true,
  },
  {
    slug: 'batch-brew',
    name: 'Batch brew',
    description: "Today's filter, already made and waiting.",
    spec: '300ml · no milk',
    basePrice: 3000,
    category: 'filter',
    tags: ['Dairy free'],
    optionGroupIds: ['size'],
  },

  // Cold -------------------------------------------------------------------
  {
    slug: 'iced-long-black',
    name: 'Iced long black',
    description: 'Two shots straight over ice, no water.',
    spec: '2 shots · 300ml · ice',
    basePrice: 3800,
    category: 'cold',
    tags: ['Dairy free'],
    optionGroupIds: ['size', 'ice', 'shots'],
  },
  {
    slug: 'iced-latte',
    name: 'Iced latte',
    description: 'Two shots, cold milk, built over ice.',
    spec: '2 shots · 350ml · whole milk',
    basePrice: 4200,
    category: 'cold',
    tags: ['Contains dairy'],
    optionGroupIds: ['size', 'milk', 'ice', 'shots'],
  },
  {
    slug: 'cold-brew',
    name: 'Cold brew',
    description: 'Steeped eighteen hours, served long over ice.',
    spec: '18 hr · 250ml · 1:12',
    basePrice: 4500,
    category: 'cold',
    tags: ['Dairy free'],
    optionGroupIds: ['size', 'ice'],
    isNew: true,
  },

  // Not coffee -------------------------------------------------------------
  {
    slug: 'matcha-latte',
    name: 'Matcha latte',
    description: 'Ceremonial grade, whisked thin, then milk.',
    spec: '4g · 280ml · whole milk',
    basePrice: 4800,
    category: 'other',
    tags: ['Contains dairy', 'Vegetarian'],
    optionGroupIds: ['size', 'milk', 'sweetness'],
  },
  {
    slug: 'hot-chocolate',
    name: 'Hot chocolate',
    description: 'Dark couverture melted into steamed milk.',
    spec: '45g · 280ml · whole milk',
    basePrice: 4000,
    category: 'other',
    tags: ['Contains dairy', 'Vegetarian'],
    optionGroupIds: ['size', 'milk'],
  },
  {
    slug: 'lemon-ginger-honey',
    name: 'Lemon, ginger and honey',
    description: 'Fresh ginger steeped long, local honey stirred through.',
    spec: '300ml · no caffeine',
    basePrice: 3200,
    category: 'other',
    tags: ['Dairy free', 'Local'],
    optionGroupIds: ['size'],
  },

  // Food -------------------------------------------------------------------
  {
    slug: 'banana-bread',
    name: 'Banana bread',
    description: 'Baked this morning, cut thick.',
    spec: '1 slice · 140g',
    basePrice: 3500,
    category: 'food',
    tags: ['Vegetarian', 'Contains gluten'],
    optionGroupIds: ['served'],
  },
  {
    slug: 'ham-cheese-croissant',
    name: 'Ham and cheese croissant',
    description: 'Leg ham and aged cheddar, pressed to order.',
    spec: '1 piece · 160g',
    basePrice: 5200,
    category: 'food',
    tags: ['Contains dairy', 'Contains gluten'],
    optionGroupIds: [],
  },
  {
    slug: 'coconut-lime-slice',
    name: 'Coconut and lime slice',
    description: 'Fresh coconut pressed with lime, cut thick.',
    spec: '1 piece · 110g',
    basePrice: 3000,
    category: 'food',
    tags: ['Vegetarian', 'Local'],
    optionGroupIds: [],
  },
]

export function getMenuItem(slug: string): MenuItem | undefined {
  return MENU.find((item) => item.slug === slug)
}

export function getOptionGroups(item: MenuItem): OptionGroup[] {
  return item.optionGroupIds.map((id) => {
    const group = OPTION_GROUPS[id]
    if (!group) throw new Error(`Unknown option group "${id}" on item "${item.slug}"`)
    return group
  })
}
