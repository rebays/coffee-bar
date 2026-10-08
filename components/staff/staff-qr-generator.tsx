'use client'

import { Printer } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal, flushSync } from 'react-dom'

import { Button } from '@/components/ui/button'

import { NfcWriteButton, useNfcWriteSupported } from './nfc-write-button'
import { TableCard, type TableCardWifi } from './table-card'

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

/** The link a table's QR code, NFC tag and printed card all carry. */
function tableUrl(label: string): string {
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  return `${origin}/menu?mode=dine-in&table=${encodeURIComponent(label)}`
}

type PrintCard = { label: string; qrDataUrl: string }

/**
 * Generated entirely client-side (the `qrcode` package draws to canvas in
 * the browser) — a table's QR just encodes a URL, so there's nothing here
 * that needs a server round-trip or persistence. Table labels are free text
 * everywhere else in the app (lib/service-context.ts), so this doesn't
 * introduce a fixed table list either.
 *
 * Each table can also be written to an NFC sticker (Chrome on Android only —
 * NfcWriteButton hides itself elsewhere) and printed as a table card, alone
 * or with every other table, four cards to an A4 sheet.
 */
export function StaffQrGenerator() {
  const [labels, setLabels] = useState<string[]>([])
  const [labelInput, setLabelInput] = useState('')
  const [rangeFrom, setRangeFrom] = useState('1')
  const [rangeTo, setRangeTo] = useState('8')
  const [wifi, setWifi] = useState<TableCardWifi>({ network: '', password: '' })
  const [nfcCards, setNfcCards] = useState(false)
  const [printJob, setPrintJob] = useState<PrintCard[] | null>(null)
  const [previewQr, setPreviewQr] = useState<string | null>(null)
  const unreachableHost = useUnreachableHost()
  const nfcWritable = useNfcWriteSupported()

  const previewLabel = labels[0] ?? '12'

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(tableUrl(previewLabel), { margin: 1, width: 320 }).then((generated) => {
      if (!cancelled) setPreviewQr(generated)
    })
    return () => {
      cancelled = true
    }
  }, [previewLabel])

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

  /**
   * Renders the cards into a print-only layer on <body>, waits for every QR
   * image to decode (a card printed before its code paints would print
   * blank), then opens the print dialog. The layer is removed after printing.
   */
  async function printCards(which: string[]) {
    if (which.length === 0) return
    // Print resolution: 600px across 50mm is ~300dpi, crisp on any printer.
    const cards = await Promise.all(
      which.map(async (label) => ({
        label,
        qrDataUrl: await QRCode.toDataURL(tableUrl(label), { margin: 1, width: 600 }),
      })),
    )
    flushSync(() => setPrintJob(cards))
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('.qr-print-root img'))
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)))
    window.addEventListener('afterprint', () => setPrintJob(null), { once: true })
    window.print()
  }

  return (
    <div className="flex flex-col gap-6">
      {unreachableHost ? (
        <p className="text-danger-text text-small">
          You&rsquo;re viewing this dashboard at {window.location.hostname} — a phone can&rsquo;t reach that
          address, so any QR code, NFC tag or card made now won&rsquo;t open for a customer. Open this page from
          the bar&rsquo;s real network address or domain first.
        </p>
      ) : null}

      <div className="border-hairline bg-raised rounded-tile flex flex-col gap-4 border p-4">
        <div>
          <p className="text-item">Add a table</p>
          <p className="text-small text-secondary">
            Each QR opens the menu with dine-in and this table already picked — one tap to ordering.
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

      <div className="border-hairline bg-raised rounded-tile flex flex-wrap gap-6 border p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-4" style={{ flexBasis: '18rem' }}>
          <div>
            <p className="text-item">Table cards</p>
            <p className="text-small text-secondary">
              A6 cards, four to an A4 sheet. Print on card stock and cut along the gaps.
              {nfcWritable
                ? ' Write each table’s NFC sticker from its own panel below.'
                : ' To write NFC stickers, open this page in Chrome on an Android phone.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="wifiNetwork" className="text-small text-secondary">
                Wi-Fi network (optional)
              </label>
              <input
                id="wifiNetwork"
                type="text"
                value={wifi.network}
                onChange={(event) => setWifi((prev) => ({ ...prev, network: event.target.value }))}
                placeholder="e.g. CoffeeBar-Guest"
                className="border-hairline rounded-input text-body border p-2"
                style={{ minInlineSize: '11rem' }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="wifiPassword" className="text-small text-secondary">
                Wi-Fi password (optional)
              </label>
              <input
                id="wifiPassword"
                type="text"
                value={wifi.password}
                onChange={(event) => setWifi((prev) => ({ ...prev, password: event.target.value }))}
                className="border-hairline rounded-input text-body border p-2"
                style={{ minInlineSize: '11rem' }}
              />
            </div>
          </div>

          <label className="text-body flex items-center gap-3">
            <input
              type="checkbox"
              checked={nfcCards}
              onChange={(event) => setNfcCards(event.target.checked)}
              className="size-5 shrink-0"
            />
            These cards will carry NFC stickers
          </label>

          <div>
            <Button size="md" disabled={labels.length === 0} onClick={() => printCards(labels)}>
              <Printer size={18} strokeWidth={1.75} aria-hidden="true" />
              {labels.length === 0
                ? 'Print all cards'
                : `Print all cards (${labels.length})`}
            </Button>
            {labels.length === 0 ? (
              <p className="text-small text-secondary mt-2">Add a table above to print its card.</p>
            ) : null}
          </div>
        </div>

        {/* Live preview of the first table's card, shrunk to fit beside the
            options. The card is sized in mm for print; 0.55 brings it to
            roughly 200px wide on screen. */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-small text-secondary">Preview{labels.length === 0 ? ' (example table)' : ''}</p>
          <div aria-hidden="true" style={{ inlineSize: 'calc(95mm * 0.55)', blockSize: 'calc(133mm * 0.55)' }}>
            {previewQr ? (
              <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left' }}>
                <TableCard label={previewLabel} qrDataUrl={previewQr} nfc={nfcCards} wifi={wifi} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {labels.length === 0 ? (
        <p className="text-body text-secondary py-8 text-center">
          No tables added yet — add one above to generate its QR code.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {labels.map((label) => (
            <TableQrCard
              key={label}
              label={label}
              onPrint={() => printCards([label])}
              onRemove={() => setLabels((prev) => prev.filter((l) => l !== label))}
            />
          ))}
        </ul>
      )}

      {printJob
        ? createPortal(
            <div className="qr-print-root" aria-hidden="true">
              {printJob.map((card) => (
                <TableCard key={card.label} label={card.label} qrDataUrl={card.qrDataUrl} nfc={nfcCards} wifi={wifi} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function TableQrCard({
  label,
  onPrint,
  onRemove,
}: {
  label: string
  onPrint: () => void
  onRemove: () => void
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const url = tableUrl(label)

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
        <Button variant="secondary" size="sm" block onClick={onPrint} aria-label={`Print the card for table ${label}`}>
          Print card
        </Button>
      </div>
      <NfcWriteButton url={url} label={label} />
      <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove table ${label}`}>
        Remove
      </Button>
    </li>
  )
}
