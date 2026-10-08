import Image from 'next/image'

/**
 * The welcome card at the top of the menu: a wide photo and a headline.
 *
 * Static on purpose — live state (open, wait, table) already sits in the
 * header, and a closed shop gets ClosedNotice under this.
 */
export function MenuHero() {
  return (
    <section aria-labelledby="menu-hero-heading" className="px-gutter pb-4">
      <div className="surface-card overflow-hidden" style={{ borderRadius: 'var(--radius-sheet)' }}>
        <div className="relative h-44 sm:h-56">
          <Image
            src="/menu/hero-coffee-beans.jpg"
            alt="Coffee beans spilling from a dark mug, beside a smiley face made of beans"
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 640px) 640px, 100vw"
            className="object-cover"
            // Keeps the bean smiley and the mug's rim in frame at every card width.
            style={{ objectPosition: 'center 55%' }}
          />
        </div>
        <div className="p-5">
          <h2 id="menu-hero-heading" className="text-title text-balance">
            Good coffee, made to order
          </h2>
        </div>
      </div>
    </section>
  )
}
