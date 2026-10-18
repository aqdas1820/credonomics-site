/** PAID receipt visibility is strictly derived from independently booked bank credits. */
export function canRenderPaidReceipt(invoice: { status: string; totalPaise: number; paidPaise: number }): boolean {
  return invoice.status === 'PAID' &&
    Number.isSafeInteger(invoice.totalPaise) && invoice.totalPaise > 0 &&
    Number.isSafeInteger(invoice.paidPaise) && invoice.paidPaise === invoice.totalPaise
}
