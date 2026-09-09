import type { MenuItem, OptionGroup } from './types.ts'

/**
 * Menu fixtures for the coffee bar and eatery in Honiara.
 *
 * Prices are real SBD, not the illustrative `$6.50` the design doc uses to
 * draw a row. All amounts are integer minor units.
 *
 * "Island Fish Sandwich" and "Coconut Iced Coffee" are the shop's best
 * sellers, so each lives once, under `best-sellers` — not also duplicated
 * under `mains`/`coffee`. One item, one category, per docs/CLAUDE.md's rule
 * that every item maps to exactly one section with no duplicate listings.
 */

export const OPTION_GROUPS: Record<string, OptionGroup> = {
  'side-sandwich': {
    id: 'side-sandwich',
    label: 'Side',
    required: true,
    defaultChoiceId: 'cassava-chips',
    choices: [
      { id: 'cassava-chips', label: 'Cassava Chips', priceDelta: 0 },
      { id: 'kumara-chips', label: 'Kumara Chips', priceDelta: 0 },
    ],
  },
  // Mains other than the sandwich also offer steamed rice.
  'side-mains': {
    id: 'side-mains',
    label: 'Side',
    required: true,
    defaultChoiceId: 'cassava-chips',
    choices: [
      { id: 'cassava-chips', label: 'Cassava Chips', priceDelta: 0 },
      { id: 'kumara-chips', label: 'Kumara Chips', priceDelta: 0 },
      { id: 'jasmine-rice', label: 'Steamed Jasmine Rice', priceDelta: 0 },
    ],
  },

  // Sweetness applies to every Coffee, Tea & Refreshers, and Coconut Iced
  // Coffee item — two variants of the same three choices, differing only in
  // default: black coffees (Espresso, Long Black) default to no sugar,
  // everything else defaults to standard. `alwaysShow` means the chosen
  // level is stated in the cart/order summary even at the default, since
  // it's information the barista needs every time.
  'sweetness-standard': {
    id: 'sweetness-standard',
    label: 'Sugar',
    required: true,
    defaultChoiceId: 'sugar-100',
    alwaysShow: true,
    choices: [
      { id: 'sugar-100', label: '100% Sugar (Standard)', priceDelta: 0 },
      { id: 'sugar-50', label: '50% Sugar (Less Sweet)', priceDelta: 0 },
      { id: 'sugar-0', label: '0% Sugar (No Sugar)', priceDelta: 0 },
    ],
  },
  'sweetness-black': {
    id: 'sweetness-black',
    label: 'Sugar',
    required: true,
    defaultChoiceId: 'sugar-0',
    alwaysShow: true,
    choices: [
      { id: 'sugar-100', label: '100% Sugar (Standard)', priceDelta: 0 },
      { id: 'sugar-50', label: '50% Sugar (Less Sweet)', priceDelta: 0 },
      { id: 'sugar-0', label: '0% Sugar (No Sugar)', priceDelta: 0 },
    ],
  },

  // Milk swap — only the standard milk coffees offer this (Flat White, among
  // this menu's current items). Never shown for Coconut Iced Coffee, Fresh
  // Green Coconut, juices, or teas, even ones made with steamed milk
  // (Matcha Latte keeps its milk fixed; only sugar is adjustable).
  milk: {
    id: 'milk',
    label: 'Milk',
    required: true,
    defaultChoiceId: 'whole',
    choices: [
      { id: 'whole', label: 'Whole Milk', priceDelta: 0 },
      { id: 'skim', label: 'Skim Milk', priceDelta: 0 },
      { id: 'oat', label: 'Oat Milk', priceDelta: 0 },
      { id: 'soy', label: 'Soy Milk', priceDelta: 0 },
    ],
  },

  // Hot/iced — offered on beverages where both are a genuine, orderable
  // drink. Deliberately NOT on every beverage: Cold Brew and Coconut Iced
  // Coffee are built on the same cold-steeped base (the brew method, not
  // just serving temperature, is what makes them what they are — there's no
  // "hot" version of a cold brew), and Fresh Green Coconut is a whole fruit
  // served chilled, not something served hot. Two variants differing only
  // in default, same shape as the sweetness pair above.
  'temperature-hot-default': {
    id: 'temperature-hot-default',
    label: 'Temperature',
    required: true,
    defaultChoiceId: 'hot',
    choices: [
      { id: 'hot', label: 'Hot', priceDelta: 0 },
      { id: 'iced', label: 'Iced', priceDelta: 0 },
    ],
  },
  'temperature-iced-default': {
    id: 'temperature-iced-default',
    label: 'Temperature',
    required: true,
    defaultChoiceId: 'iced',
    choices: [
      { id: 'hot', label: 'Hot', priceDelta: 0 },
      { id: 'iced', label: 'Iced', priceDelta: 0 },
    ],
  },
}

export const MENU: MenuItem[] = [
  // Best Sellers -------------------------------------------------------------
  {
    slug: 'coconut-iced-coffee',
    name: 'Coconut Iced Coffee',
    description: 'Cold brew coffee poured over chilled local coconut milk.',
    spec: 'Cold brew · coconut milk',
    basePrice: 3500,
    category: 'best-sellers',
    tags: [],
    optionGroupIds: ['sweetness-standard'],
  },
  {
    slug: 'island-fish-sandwich',
    name: 'Island Fish Sandwich',
    description:
      'Pan-seared local reef catch served on a toasted bun with house herbs and citrus aioli.',
    spec: 'Toasted bun · citrus aioli',
    basePrice: 7000,
    category: 'best-sellers',
    tags: [],
    optionGroupIds: ['side-sandwich'],
  },

  // Coffee --------------------------------------------------------------------
  {
    slug: 'espresso',
    name: 'Espresso',
    description: 'A double shot of dark roast coffee.',
    spec: 'Double shot',
    basePrice: 2500,
    category: 'coffee',
    tags: [],
    optionGroupIds: ['temperature-hot-default', 'sweetness-black'],
  },
  {
    slug: 'flat-white',
    name: 'Flat White',
    description: 'Rich espresso balanced with velvety steamed milk.',
    spec: 'Espresso · steamed milk',
    basePrice: 3000,
    category: 'coffee',
    tags: [],
    optionGroupIds: ['temperature-hot-default', 'milk', 'sweetness-standard'],
  },
  {
    slug: 'long-black',
    name: 'Long Black',
    description: 'Double shot of espresso poured over hot water.',
    spec: 'Double shot · hot water',
    basePrice: 3000,
    category: 'coffee',
    tags: [],
    optionGroupIds: ['temperature-hot-default', 'sweetness-black'],
  },
  {
    slug: 'cold-brew',
    name: 'Cold Brew',
    description: 'Slow-steeped iced coffee served black over ice.',
    spec: 'Slow-steeped · served over ice',
    basePrice: 3200,
    category: 'coffee',
    tags: [],
    optionGroupIds: ['sweetness-standard'],
  },

  // Tea & Refreshers -----------------------------------------------------------
  {
    slug: 'fresh-green-coconut',
    name: 'Fresh Green Coconut',
    description: 'Whole fresh coconut served chilled with natural juice.',
    spec: 'Served chilled',
    basePrice: 1500,
    category: 'tea-refreshers',
    tags: ['VG', 'GF'],
    optionGroupIds: ['sweetness-standard'],
  },
  {
    slug: 'fresh-lime-honey-juice',
    name: 'Fresh Lime & Honey Juice',
    description: 'Hand-pressed local limes blended with island honey and water.',
    spec: 'Hand-pressed · chilled',
    basePrice: 2500,
    category: 'tea-refreshers',
    tags: ['V', 'GF'],
    optionGroupIds: ['temperature-iced-default', 'sweetness-standard'],
  },
  {
    slug: 'iced-hibiscus-tea',
    name: 'Iced Hibiscus Tea',
    description: 'Chilled steep of dried hibiscus flowers with a touch of sweetness.',
    spec: 'Chilled · lightly sweetened',
    basePrice: 2500,
    category: 'tea-refreshers',
    tags: ['VG', 'GF'],
    optionGroupIds: ['temperature-iced-default', 'sweetness-standard'],
  },
  {
    slug: 'matcha-latte',
    name: 'Matcha Latte',
    description: 'Whisked green tea powder with steamed milk.',
    spec: 'Whisked · steamed milk',
    basePrice: 3500,
    category: 'tea-refreshers',
    tags: ['V'],
    optionGroupIds: ['temperature-hot-default', 'sweetness-standard'],
  },

  // Mains -----------------------------------------------------------------
  {
    slug: 'creamy-coconut-chicken',
    name: 'Creamy Coconut Chicken',
    description: 'Tender chicken thigh simmered gently in spiced coconut cream sauce.',
    spec: 'Coconut cream sauce',
    basePrice: 7500,
    category: 'mains',
    tags: ['GF'],
    optionGroupIds: ['side-mains'],
  },
  {
    slug: 'garlic-butter-prawn-bowl',
    name: 'Garlic Butter Prawn Bowl',
    description: 'Local sea prawns sautéed in rich garlic butter and herbs.',
    spec: 'Garlic butter · herbs',
    basePrice: 8500,
    category: 'mains',
    tags: ['GF'],
    optionGroupIds: ['side-mains'],
  },

  // Sandwich ----------------------------------------------------------------
  {
    slug: 'chicken-pesto-sandwich',
    name: 'Chicken Pesto Sandwich',
    description: 'Grilled chicken breast with basil pesto on toasted bread.',
    spec: 'Grilled chicken · pesto',
    basePrice: 9900,
    category: 'sandwich',
    tags: [],
    optionGroupIds: ['side-sandwich'],
  },
  {
    slug: 'chicken-avocado',
    name: 'Chicken & Avocado',
    description: 'Sliced chicken breast with fresh avocado on toasted bread.',
    spec: 'Chicken · avocado',
    basePrice: 8600,
    category: 'sandwich',
    tags: [],
    optionGroupIds: ['side-sandwich'],
  },
  {
    slug: 'ham-cheese-toastie',
    name: 'Ham & Cheese Toastie',
    description: 'Leg ham and melted cheese, pressed and toasted.',
    spec: 'Toasted · melted cheese',
    basePrice: 8900,
    category: 'sandwich',
    tags: [],
    optionGroupIds: ['side-sandwich'],
  },

  // Salad ---------------------------------------------------------------------
  {
    slug: 'caesar-salad',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons and Caesar dressing.',
    spec: 'Romaine · parmesan · croutons',
    basePrice: 9600,
    category: 'salad',
    tags: [],
    optionGroupIds: [],
  },
  {
    slug: 'garden-salad',
    name: 'Garden Salad',
    description: 'Fresh mixed greens with seasonal vegetables.',
    spec: 'Mixed greens · seasonal veg',
    basePrice: 9600,
    category: 'salad',
    tags: [],
    optionGroupIds: [],
  },
  {
    slug: 'greek-salad',
    name: 'Greek Salad',
    description: 'Tomato, cucumber, olives and feta with a light dressing.',
    spec: 'Tomato · cucumber · feta',
    basePrice: 9800,
    category: 'salad',
    tags: [],
    optionGroupIds: [],
  },

  // Sides -------------------------------------------------------------------
  {
    slug: 'cassava-chips',
    name: 'Cassava Chips',
    description: 'Crispy hand-cut local cassava roots served with garlic dipping sauce.',
    spec: 'Hand-cut · garlic dip',
    basePrice: 3000,
    category: 'sides',
    tags: ['V'],
    optionGroupIds: [],
  },
  {
    slug: 'kumara-chips',
    name: 'Kumara Chips',
    description: 'Golden fried local sweet potato chips served with savory mayo.',
    spec: 'Golden fried · savory mayo',
    basePrice: 3500,
    category: 'sides',
    tags: ['V'],
    optionGroupIds: [],
  },

  // Bakery & Desserts -----------------------------------------------------------
  {
    slug: 'pineapple-cake',
    name: 'Pineapple Cake',
    description: 'Moist sponge cake baked with sweet caramelized island pineapple slices.',
    spec: 'Sponge cake · caramelized pineapple',
    basePrice: 2500,
    category: 'bakery-desserts',
    tags: ['V'],
    optionGroupIds: [],
  },
  {
    slug: 'banana-bread',
    name: 'Banana Bread',
    description: 'Dense, house-baked loaf made with ripe local bananas.',
    spec: 'House-baked loaf',
    basePrice: 2000,
    category: 'bakery-desserts',
    tags: ['V'],
    optionGroupIds: [],
  },
  {
    slug: 'coconut-scone',
    name: 'Coconut Scone',
    description: 'Warm baked scone infused with shaved coconut and served with butter.',
    spec: 'Shaved coconut · served with butter',
    basePrice: 2000,
    category: 'bakery-desserts',
    tags: ['V'],
    optionGroupIds: [],
  },
  {
    slug: 'butter-croissant',
    name: 'Butter Croissant',
    description: 'Flaky, golden-baked French pastry.',
    spec: 'Flaky · French pastry',
    basePrice: 2500,
    category: 'bakery-desserts',
    tags: ['V'],
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
