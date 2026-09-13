'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { showToast } from '@/lib/toast-store'
import type { StaffOrderView } from '@/lib/orders/staff-view'

import { KitchenTicket } from './kitchen-ticket'

const POLL_INTERVAL_MS = 2000

/** A ticket this board can show — the three live states it cares about. */
type KitchenOrder = StaffOrderView & { state: 'paid' | 'making' | 'ready' }

function isKitchenOrder(order: StaffOrderView): order is KitchenOrder {
  return order.state === 'paid' || order.state === 'making' || order.state === 'ready'
}

/** The three stages a ticket moves through here, left to right. */
type Stage = 'queue' | 'making' | 'ready'

const STAGE_FOR_STATE: Record<KitchenOrder['state'], Stage> = {
  paid: 'queue',
  making: 'making',
  ready: 'ready',
}

const STAGE_COPY: Record<Stage, { heading: string; empty: string }> = {
  queue: { heading: 'Queue', empty: 'No new orders.' },
  making: { heading: 'Making', empty: 'Nothing on the go.' },
  ready: { heading: 'Ready for pickup', empty: 'Nothing ready.' },
}

const ACTION_FOR_STAGE: Record<Stage, 'start_making' | 'ready' | 'collected'> = {
  queue: 'start_making',
  making: 'ready',
  ready: 'collected',
}

/**
 * A short chime via WebAudio rather than an audio file asset — best-effort;
 * a browser that blocks audio without a prior user gesture just stays
 * silent, which is an acceptable degradation for a notification sound.
 */
function playChime() {
  try {
    const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioContextCtor()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.6)
  } catch {
    // Silence is an acceptable degradation here.
  }
}

/**
 * Three columns a ticket flows through left to right — queue, making, ready
 * for pickup — rather than the old single grid of mixed-state cards. Moving
 * a ticket to its next stage is a real state transition (the same
 * start_making/ready/collected actions the main staff dashboard uses), so a
 * card "moving column" is just this component re-deriving which column an
 * order's current state belongs in on the next poll — no separate board
 * state to keep in sync with the order store.
 *
 * Real order data, real transitions — this reuses the same staff-session
 * gated /api/staff/orders (list) and /api/staff/orders/[id] (PATCH) routes
 * the main staff dashboard already uses, just presented as big tickets. The
 * "dual-screen sync" with a customer's own order-status page already exists
 * too: that page already polls /api/orders/[id] every few seconds, so a
 * transition made here is visible there shortly after, no separate
 * WebSocket/localStorage channel needed.
 */
export function KitchenDashboard({ initialOrders }: { initialOrders: StaffOrderView[] }) {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders.filter(isKitchenOrder))
  const [pendingId, setPendingId] = useState<string | null>(null)
  // Seeded from the initial, already-paid orders so the chime/print toast
  // only ever fires for a ticket that's new *since this screen opened*.
  const knownPaidIds = useRef<Set<string>>(
    new Set(initialOrders.filter((order) => order.state === 'paid').map((order) => order.id)),
  )

  const fetchOrders = useCallback(async () => {
    const response = await fetch('/api/staff/orders', { cache: 'no-store' })
    if (!response.ok) return
    const data: { orders: StaffOrderView[] } = await response.json()
    const kitchenOrders = data.orders.filter(isKitchenOrder)

    const newlyPaid = kitchenOrders.filter(
      (order) => order.state === 'paid' && !knownPaidIds.current.has(order.id),
    )
    if (newlyPaid.length > 0) {
      playChime()
      showToast('🖨️ Ticket printed to kitchen counter')
    }
    knownPaidIds.current = new Set(kitchenOrders.filter((o) => o.state === 'paid').map((o) => o.id))
    setOrders(kitchenOrders)
  }, [])

  useEffect(() => {
    const interval = setInterval(fetchOrders, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchOrders])

  async function handleAction(orderId: string, action: 'start_making' | 'ready' | 'collected') {
    setPendingId(orderId)
    await fetch(`/api/staff/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setPendingId(null)
    fetchOrders()
  }

  const columns: { stage: Stage; orders: KitchenOrder[] }[] = (['queue', 'making', 'ready'] as const).map(
    (stage) => ({
      stage,
      orders: orders.filter((order) => STAGE_FOR_STATE[order.state] === stage),
    }),
  )

  return (
    <main data-theme="dark" data-density="kiosk" data-surface="staff" className="bg-ground text-primary flex w-full flex-1 flex-col gap-4 px-6 py-6">
      <h1 className="text-title">Kitchen display</h1>

      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map(({ stage, orders: stageOrders }) => (
          <section key={stage} className="border-hairline bg-raised rounded-tile flex flex-col gap-3 border p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-section">{STAGE_COPY[stage].heading}</h2>
              <span className="bg-tag text-secondary text-spec wdth-condensed inline-flex min-w-[1.75rem] items-center justify-center rounded-full px-2 py-1">
                {stageOrders.length}
              </span>
            </div>

            {stageOrders.length === 0 ? (
              <p className="text-body text-secondary py-8 text-center">{STAGE_COPY[stage].empty}</p>
            ) : (
              <ul className="flex flex-col gap-3 overflow-y-auto" style={{ maxBlockSize: '75vh' }}>
                {stageOrders.map((order) => (
                  <KitchenTicket
                    key={order.id}
                    order={order}
                    pending={pendingId === order.id}
                    onAction={() => handleAction(order.id, ACTION_FOR_STAGE[stage])}
                  />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}
