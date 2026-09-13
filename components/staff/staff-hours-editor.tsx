'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/toast-store'
import type { WeeklyHours } from '@/lib/shop-hours-store'

function minutesToTimeValue(minutes: number): string {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function timeValueToMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

/**
 * docs/CLAUDE.md open question territory: the schedule itself was a fixed
 * constant until now (lib/shop-hours-store.ts). Sits above StaffStoreStatus
 * in Settings — that component's Force open/closed override still wins over
 * whatever's set here, same as it already wins over the schedule today.
 */
export function StaffHoursEditor() {
  const [hours, setHoursState] = useState<WeeklyHours | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    fetch('/api/staff/hours', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: WeeklyHours | null) => {
        if (data) setHoursState(data)
      })
  }, [])

  if (hours === null) return null

  function update(day: keyof WeeklyHours, field: 'opensMinute' | 'closesMinute', value: string) {
    setHoursState((prev) => (prev ? { ...prev, [day]: { ...prev[day], [field]: timeValueToMinutes(value) } } : prev))
  }

  async function save() {
    setPending(true)

    const response = await fetch('/api/staff/hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hours),
    })
    if (response.ok) {
      setHoursState(await response.json())
      showToast('Operating hours saved')
    } else {
      showToast('Closing time must be after opening time.', 'error')
    }
    setPending(false)
  }

  return (
    <div className="border-hairline bg-raised rounded-tile flex flex-col gap-4 border p-4">
      <div>
        <p className="text-item">Operating hours</p>
        <p className="text-small text-secondary">Feeds the Auto (schedule) option below.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-small text-secondary">Weekdays (Mon–Fri)</legend>
          <div className="flex items-center gap-2">
            <input
              type="time"
              aria-label="Weekday opening time"
              value={minutesToTimeValue(hours.weekday.opensMinute)}
              onChange={(event) => update('weekday', 'opensMinute', event.target.value)}
              className="border-hairline rounded-input text-body border p-2"
            />
            <span className="text-secondary text-small">to</span>
            <input
              type="time"
              aria-label="Weekday closing time"
              value={minutesToTimeValue(hours.weekday.closesMinute)}
              onChange={(event) => update('weekday', 'closesMinute', event.target.value)}
              className="border-hairline rounded-input text-body border p-2"
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-small text-secondary">Weekends (Sat–Sun)</legend>
          <div className="flex items-center gap-2">
            <input
              type="time"
              aria-label="Weekend opening time"
              value={minutesToTimeValue(hours.weekend.opensMinute)}
              onChange={(event) => update('weekend', 'opensMinute', event.target.value)}
              className="border-hairline rounded-input text-body border p-2"
            />
            <span className="text-secondary text-small">to</span>
            <input
              type="time"
              aria-label="Weekend closing time"
              value={minutesToTimeValue(hours.weekend.closesMinute)}
              onChange={(event) => update('weekend', 'closesMinute', event.target.value)}
              className="border-hairline rounded-input text-body border p-2"
            />
          </div>
        </fieldset>
      </div>

      <div>
        <Button variant="secondary" size="md" onClick={save} disabled={pending}>
          {pending ? 'Saving…' : 'Save hours'}
        </Button>
      </div>
    </div>
  )
}
