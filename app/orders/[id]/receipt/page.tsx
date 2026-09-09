import { notFound } from 'next/navigation'

import { ReceiptPrintButton } from '@/components/order/receipt-print-button'
import { formatSBD, formatSBDSpoken } from '@/lib/money'
import { toHistoryView } from '@/lib/orders/history-view'
import { getOrder } from '@/lib/orders/store'

/**
 * A real, printable route — no access check beyond the id, same reasoning
 * status-view.ts already gives for /order/[id]: the pickup code screen is
 * the receipt, so this is that data reformatted to print cleanly rather
 * than a new trust boundary.
 */
export default async function ReceiptPage(props: PageProps<'/orders/[id]/receipt'>) {
  const { id } = await props.params
  const order = getOrder(id)
  if (!order) notFound()

  const view = toHistoryView(order)

  return (
    <main
      className="px-gutter mx-auto flex w-full flex-1 flex-col gap-6 py-8"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <h1 className="sr-only">Receipt</h1>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-item">Coffee Bar</p>
        <p className="text-small text-tertiary">
          {new Date(view.createdAt).toLocaleString([], {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-spec wdth-condensed text-secondary">Pickup code</p>
        <p className="text-metric" aria-label={`Pickup code ${view.pickupCode.split('').join(' ')}`}>
          {view.pickupCode}
        </p>
      </div>

      <ul className="divide-hairline w-full divide-y">
        {view.lines.map((line, index) => (
          <li key={index} className="flex flex-col gap-0.5 py-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-body">
                {line.quantity} × {line.name}
                {line.customizations.length > 0 ? (
                  <span className="text-secondary"> ({line.customizations.join(', ')})</span>
                ) : null}
              </span>
              <span className="text-price shrink-0">{formatSBD(line.lineTotal)}</span>
            </div>
            {line.notes ? <p className="tasting-note">“{line.notes}”</p> : null}
          </li>
        ))}
      </ul>

      <div className="border-hairline flex items-center justify-between border-t pt-3">
        <span className="text-body text-secondary">Total</span>
        <span className="text-price" aria-label={formatSBDSpoken(view.total)}>
          {formatSBD(view.total)}
        </span>
      </div>

      {view.cancelReason ? (
        <p className="text-danger-text text-small text-center">Cancelled — {view.cancelReason}</p>
      ) : null}

      <p className="text-small text-tertiary text-center">Order {view.id}</p>

      <ReceiptPrintButton />
    </main>
  )
}
