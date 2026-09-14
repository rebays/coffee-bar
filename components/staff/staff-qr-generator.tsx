'use client'

import QRCode from 'qrcode'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'

const UNREACHABLE_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

const noSubscription = () => () => {}

/**
 * `localhost`/a bare LAN IP is only reachable from the machine that served
 * the page — a phone scanning a QR generated from one gets a dead
 * connection. useSyncExternalStore (not a plain effect) reads it: the
 * server snapshot is always "reachable" so there's no hydration mismatch,
 * and the real check runs as soon as the client takes over.
 */
function useUnreachableHost(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => UNREACHABLE_HOSTS.has(window.location.hostname),
    () => false,
  )
}

/**
 * Generated entirely client-side (the `qrcode` package draws to canvas in
 * the browser) — a table's QR just encodes a URL, so there's nothing here
 * that needs a server round-trip or persistence. Table labels are free text
 * everywhere else in the app (lib/service-context.ts), so this doesn't
 * introduce a fixed table list either.
 */
export function StaffQrGenerator() {
  const [labels, setLabels] = useState<string[]>([])
  const [labelInput, setLabelInput] = useState('')
  const [rangeFrom, setRangeFrom] = useState('1')
  const [rangeTo, setRangeTo] = useState('8')
  const unreachableHost = useUnreachableHost()

  function addLabel(label: string) {
    const trimmed = label.trim()
    if (!trimmed) return
    setLabels((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
  }

  function addRange() {
    const from = Number(rangeFrom)
    const to = Number(rangeTo)
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) return
    // A staff member fat-fingering a huge range shouldn't hang the tab.
    const capped = Math.min(to, from + 99)
    const next = Array.from({ length: capped - from + 1 }, (_, i) => String(from + i))
    setLabels((prev) => [...prev, ...next.filter((label) => !prev.includes(label))])
  }

  return (
    <div className="flex flex-col gap-6">
      {unreachableHost ? (
        <p className="text-danger-text text-small">
          You&rsquo;re viewing this dashboard at {window.location.hostname} — a phone can&rsquo;t reach that
          address, so any QR code generated now won&rsquo;t open for a customer. Open this page from the bar&rsquo;s
          real network address or domain first.
        </p>
      ) : null}

      <div className="border-hairline bg-raised rounded-tile flex flex-col gap-4 border p-4">
        <div>
          <p className="text-item">Add a table</p>
          <p className="text-small text-secondary">
            Each QR opens the homepage with dine-in and this table already picked — one tap to the menu.
          </p>
        </div>

        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            addLabel(labelInput)
            setLabelInput('')
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="tableLabel" className="text-small text-secondary">
              Table number or name
            </label>
            <input
              id="tableLabel"
              type="text"
              value={labelInput}
              onChange={(event) => setLabelInput(event.target.value)}
              placeholder="e.g. 12 or Patio 3"
              className="border-hairline rounded-input text-body border p-2"
              style={{ minInlineSize: '10rem' }}
            />
          </div>
          <Button type="submit" size="md">
            Add table
          </Button>
        </form>

        <form
          className="border-hairline flex flex-wrap items-end gap-3 border-t pt-4"
          onSubmit={(event) => {
            event.preventDefault()
            addRange()
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="rangeFrom" className="text-small text-secondary">
              From table
            </label>
            <input
              id="rangeFrom"
              type="number"
              min={1}
              value={rangeFrom}
              onChange={(event) => setRangeFrom(event.target.value)}
              className="border-hairline rounded-input text-body border p-2"
              style={{ inlineSize: '6rem' }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="rangeTo" className="text-small text-secondary">
              To table
            </label>
            <input
              id="rangeTo"
              type="number"
              min={1}
              value={rangeTo}
              onChange={(event) => setRangeTo(event.target.value)}
              className="border-hairline rounded-input text-body border p-2"
              style={{ inlineSize: '6rem' }}
            />
          </div>
          <Button type="submit" variant="secondary" size="md">
            Add range
          </Button>
        </form>
      </div>

      {labels.length === 0 ? (
        <p className="text-body text-secondary py-8 text-center">
          No tables added yet — add one above to generate its QR code.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {labels.map((label) => (
            <TableQrCard key={label} label={label} onRemove={() => setLabels((prev) => prev.filter((l) => l !== label))} />
          ))}
        </ul>
      )}
    </div>
  )
}

function TableQrCard({ label, onRemove }: { label: string; onRemove: () => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const url = `${typeof window === 'undefined' ? '' : window.location.origin}/?mode=dine-in&table=${encodeURIComponent(label)}`

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(url, { margin: 1, width: 320 }).then((generated) => {
      if (!cancelled) setDataUrl(generated)
    })
    return () => {
      cancelled = true
    }
  }, [url])

  return (
    <li className="border-hairline bg-raised rounded-tile flex flex-col items-center gap-3 border p-4">
      <p className="text-item">Table {label}</p>
      <div className="bg-ground rounded-tile flex aspect-square w-full items-center justify-center">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- a generated data: URL, not an optimizable static asset
          <img src={dataUrl} alt={`QR code for table ${label}`} width={320} height={320} className="w-full" />
        ) : (
          <p className="text-small text-secondary">Generating…</p>
        )}
      </div>
      <p className="text-small text-secondary w-full truncate text-center" title={url}>
        {url}
      </p>
      <div className="flex w-full gap-2">
        <Button
          variant="secondary"
          size="sm"
          block
          disabled={!dataUrl}
          onClick={() => {
            if (!dataUrl) return
            const link = document.createElement('a')
            link.href = dataUrl
            link.download = `table-${label}-qr.png`
            link.click()
          }}
        >
          Download
        </Button>
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove table ${label}`}>
          Remove
        </Button>
      </div>
    </li>
  )
}
