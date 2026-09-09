'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { showToast } from '@/lib/toast-store'
import type { StaffOrderView } from '@/lib/orders/staff-view'

import { KitchenTicket } from './kitchen-ticket'

const POLL_INTERVAL_MS = 2000

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
 * Real order data, real transitions — this reuses the same staff-session
 * gated /api/staff/orders (list) and /api/staff/orders/[id] (PATCH) routes
 * the main staff dashboard already uses, just presented as big tickets. The
 * "dual-screen sync" with a customer's own order-status page already exists
 * too: that page already polls /api/orders/[id] every few seconds, so a
 * transition made here is visible there shortly after, no separate
 * WebSocket/localStorage channel needed.
 */
export function KitchenDashboard({ initialOrders }: { initialOrders: StaffOrderView[] }) {
  const [orders, setOrders] = useState(initialOrders)
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
    const kitchenOrders = data.orders.filter((order) => order.state === 'paid' || order.state === 'making')

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

  async function handleAction(orderId: string, action: 'start_making' | 'ready') {
    setPendingId(orderId)
    await fetch(`/api/staff/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setPendingId(null)
    fetchOrders()
  }

  return (
    <main
      data-density="kiosk"
      className="px-gutter mx-auto flex w-full flex-1 flex-col gap-4 py-6"
      style={{ maxInlineSize: 'var(--container-menu)' }}
    >
      <h1 className="text-title">Kitchen display</h1>

      {orders.length === 0 ? (
        <p className="text-body text-secondary py-8 text-center">No tickets right now.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {orders.map((order) => (
            <KitchenTicket
              key={order.id}
              order={order}
              pending={pendingId === order.id}
              onAction={(action) => handleAction(order.id, action)}
            />
          ))}
        </ul>
      )}
    </main>
  )
}
