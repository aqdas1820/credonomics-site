/** Trusted internal source events must carry stable, non-PII unique IDs. */
export function isValidInvoiceSourceEventId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9:_-]{8,128}$/.test(value)
}
