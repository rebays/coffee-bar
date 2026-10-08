import { Coffee, Nfc, Wifi } from 'lucide-react'

export type TableCardWifi = { network: string; password: string }

/**
 * The printable table card — A6-proportioned (95 × 133 mm), sized in
 * millimetres and points because it only exists to be printed. Four fit on
 * an A4 sheet (see `.qr-print-root` in app/globals.css).
 *
 * Pinned to the light theme whatever the dashboard is showing: a card on a
 * table is ink on white card stock, and the teal fills print because of
 * `print-color-adjust: exact` on `.table-card`.
 */
export function TableCard({
  label,
  qrDataUrl,
  nfc,
  wifi,
}: {
  label: string
  qrDataUrl: string
  /** The card will carry an NFC sticker, so it should say "or tap". */
  nfc: boolean
  wifi?: TableCardWifi
}) {
  const showWifi = wifi && wifi.network.trim() !== ''

  return (
    <article
      data-theme="light"
      aria-label={`Table card for table ${label}`}
      className="table-card bg-raised text-primary flex flex-col items-center justify-between text-center"
      style={{
        inlineSize: '95mm',
        blockSize: '133mm',
        padding: '7mm 6mm',
        borderRadius: '6mm',
        border: '0.8mm solid var(--accent-brand)',
        boxSizing: 'border-box',
      }}
    >
      <div className="flex items-center" style={{ gap: '2.5mm' }}>
        <span
          aria-hidden="true"
          className="bg-brand text-on-accent inline-flex items-center justify-center"
          style={{ inlineSize: '10mm', blockSize: '10mm', borderRadius: '2.5mm' }}
        >
          <Coffee size={22} strokeWidth={2} />
        </span>
        <span className="font-display" style={{ fontSize: '20pt', fontWeight: 800, lineHeight: 1 }}>
          Coffee Bar
        </span>
      </div>

      <p className="font-display" style={{ fontSize: '14pt', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
        {nfc ? 'Scan or tap to order from your seat' : 'Scan to order from your seat'}
      </p>

      <div className="bg-brand" style={{ padding: '2.5mm', borderRadius: '4mm' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a generated data: URL, not an optimizable asset */}
        <img
          src={qrDataUrl}
          alt={`QR code for table ${label}`}
          // The QR image carries its own white quiet zone, so no fill is needed here.
          style={{ inlineSize: '50mm', blockSize: '50mm', display: 'block', borderRadius: '2mm' }}
        />
      </div>

      <span
        className="bg-accent text-on-accent font-display"
        style={{ fontSize: '15pt', fontWeight: 800, padding: '1.5mm 6mm', borderRadius: '999px', lineHeight: 1.2 }}
      >
        Table {label}
      </span>

      {nfc ? (
        <p className="text-secondary flex items-center" style={{ fontSize: '9pt', gap: '1.5mm', margin: 0 }}>
          <Nfc size={16} strokeWidth={1.75} aria-hidden="true" className="text-brand" />
          Or tap your phone on the NFC sticker
        </p>
      ) : null}

      {showWifi ? (
        <p className="text-secondary flex items-center" style={{ fontSize: '8.5pt', gap: '1.5mm', margin: 0 }}>
          <Wifi size={14} strokeWidth={1.75} aria-hidden="true" className="text-brand" />
          Wi-Fi: {wifi.network.trim()}
          {wifi.password.trim() ? ` · Password: ${wifi.password.trim()}` : ''}
        </p>
      ) : null}
    </article>
  )
}
