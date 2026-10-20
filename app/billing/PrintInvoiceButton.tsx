'use client'
export default function PrintInvoiceButton() {
  return <button type="button" onClick={() => window.print()}>Print / Save PDF</button>
}
