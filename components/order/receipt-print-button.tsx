'use client'

import { Button } from '@/components/ui/button'

/** print:hidden — the button itself has no reason to appear on the printed page it produces. */
export function ReceiptPrintButton() {
  return (
    <Button size="lg" block onClick={() => window.print()} className="print:hidden">
      Print / Save as PDF
    </Button>
  )
}
