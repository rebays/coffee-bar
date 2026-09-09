'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { saveServiceContext } from '@/lib/service-context'

/**
 * The manual fallback for someone who opened the bare URL rather than
 * scanning a table's QR — so there's no table number to capture here.
 * Neither choice is "more primary" than the other, so both stay in the
 * system's secondary (hairline, not cyan) treatment rather than one of them
 * borrowing the accent colour meant for a single action per screen.
 */
export function HomeServiceCards() {
  const router = useRouter()

  function choose(serviceType: 'dine-in' | 'takeaway') {
    saveServiceContext(serviceType)
    router.push('/menu')
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <ServiceCard
        label="Dine-in"
        description="Ordering from a table in the bar"
        icon={<DineInIcon />}
        onClick={() => choose('dine-in')}
      />
      <ServiceCard
        label="Takeaway"
        description="Ordering to go"
        icon={<TakeawayIcon />}
        onClick={() => choose('takeaway')}
      />
    </div>
  )
}

function ServiceCard({
  label,
  description,
  icon,
  onClick,
}: {
  label: string
  description: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'border-hairline hover:bg-sunken text-primary flex items-center gap-4 rounded-pill border px-6 text-start',
        'transition-colors duration-(--dur-fast) ease-(--ease-standard)',
      ].join(' ')}
      style={{ blockSize: '5rem' }}
    >
      <span aria-hidden="true" className="text-accent shrink-0">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-item">{label}</span>
        <span className="text-small text-secondary">{description}</span>
      </span>
    </button>
  )
}

function DineInIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M4 20V4M4 4h4M4 12h4M20 20V4M20 4h-4M20 12h-4M9 20V9a3 3 0 0 1 6 0v11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TakeawayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path
        d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
