'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { ButtonSize, ButtonVariant } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { MenuRowSkeleton, Skeleton } from '@/components/ui/skeleton'
import { Stepper } from '@/components/ui/stepper'
import { Tag } from '@/components/ui/tag'
import { MenuList } from '@/components/menu/menu-list'
import { MENU } from '@/lib/fixtures'

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'destructive']
const SIZES: ButtonSize[] = ['sm', 'md', 'lg']

const MILKS = [
  { id: 'whole', label: 'Whole', priceDelta: 0 },
  { id: 'skim', label: 'Skim', priceDelta: 0 },
  { id: 'oat', label: 'Oat', priceDelta: 800 },
  { id: 'soy', label: 'Soy', priceDelta: 500 },
]

export function Specimens() {
  const [milk, setMilk] = useState('whole')
  const [filter, setFilter] = useState('espresso')
  const [quantity, setQuantity] = useState(1)
  const [removed, setRemoved] = useState(false)

  return (
    <div className="flex flex-col gap-10">
      <Section title="Button">
        {SIZES.map((size) => (
          <Row key={size} label={size}>
            {VARIANTS.map((variant) => (
              <Button key={variant} variant={variant} size={size}>
                {variant === 'primary' ? 'Add to order' : label(variant)}
              </Button>
            ))}
          </Row>
        ))}
        <Row label="disabled">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {label(variant)}
            </Button>
          ))}
        </Row>
        <Row label="block">
          <Button block size="lg">
            Place order
          </Button>
        </Row>
      </Section>

      <Section title="Option chip">
        <Row label="radio">
          {MILKS.map((choice) => (
            <Chip
              key={choice.id}
              label={choice.label}
              priceDelta={choice.priceDelta}
              selected={milk === choice.id}
              selectionRole="radio"
              onClick={() => setMilk(choice.id)}
            />
          ))}
        </Row>
        <Row label="toggle">
          {['espresso', 'filter', 'cold'].map((id) => (
            <Chip
              key={id}
              label={label(id)}
              selected={filter === id}
              onClick={() => setFilter(id)}
            />
          ))}
        </Row>
        <Row label="disabled">
          <Chip label="Coconut" disabled />
          <Chip label="Coconut" selected disabled />
        </Row>
      </Section>

      <Section title="Quantity stepper">
        <Row label="quantity">
          <Stepper
            value={quantity}
            onChange={setQuantity}
            onRemove={() => setRemoved(true)}
            itemLabel="flat white"
          />
          <span className="text-small text-secondary">
            {removed ? 'Removed' : 'Minus removes at 1'}
          </span>
        </Row>
        <Row label="at max">
          <Stepper value={20} onChange={() => {}} itemLabel="flat white" />
        </Row>
      </Section>

      <Section title="Tag">
        <Row label="variants">
          <Tag>Dairy free</Tag>
          <Tag>Contains gluten</Tag>
          <Tag variant="new">New</Tag>
          <Tag variant="sold-out">Sold out</Tag>
        </Row>
      </Section>

      <Section title="Skeleton">
        <Row label="blocks">
          <div className="flex flex-col gap-2">
            <Skeleton width="12rem" height="2rem" />
            <Skeleton width="8rem" />
          </div>
        </Row>
        <div className="mt-2">
          <MenuRowSkeleton />
          <MenuRowSkeleton />
        </div>
      </Section>

      <Section title="Menu row">
        <Row label="full width — includes the sold-out item and both origin roasts">
          <div className="border-hairline w-full rounded-tile border">
            <MenuList items={MENU} />
          </div>
        </Row>
        <Row label="320px — the row must hold and prices must still align">
          <div className="border-hairline overflow-hidden rounded-tile border" style={{ inlineSize: '320px' }}>
            <MenuList items={MENU} />
          </div>
        </Row>
      </Section>

      <Section title="Type scale">
        <div className="flex flex-col gap-3">
          <p className="text-display">Display 56</p>
          <p className="text-metric">$1,234.50</p>
          <p className="text-title">Kenya Kiambu</p>
          <p className="text-section">On filter today</p>
          <p className="text-item">Flat white</p>
          <p className="text-body-lg">Body large, eighteen over twenty-eight.</p>
          <p className="text-body">Body, the default sixteen over twenty-four.</p>
          <p className="text-small">Small, fourteen over twenty.</p>
          <p className="tasting-note">Blackcurrant, brown sugar, clean finish</p>
          <p className="text-spec wdth-condensed text-secondary">
            2 shots · 180ml · whole milk
          </p>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-section">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label: name, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-spec wdth-condensed text-tertiary">{name}</p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
