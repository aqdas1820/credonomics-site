/**
 * Pure, dependency-free invoice draft validation.
 * This is NOT a payment-verification module.
 */
export type InvoiceLine = { description: string; quantity: string; rate: string }
export type InvoiceDraft = { number: string; date: string; customer: string; items: InvoiceLine[] }

const MAX_LINE_PAISE = 10_000_000_000 // ₹10 crore per line
const MAX_TOTAL_PAISE = 10_000_000_000

function decimalToPaise(value: string): number | null {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)) return null
  const [rupees, fractional = ''] = value.split('.')
  const result = Number(rupees) * 100 + Number(fractional.padEnd(2, '0'))
  return Number.isSafeInteger(result) && result <= MAX_LINE_PAISE ? result : null
}

function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(value + 'T00:00:00.000Z')
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function calculateInvoice(draft: InvoiceDraft): { valid: boolean; totalPaise: number; linePaise: number[]; errors: string[] } {
  const errors: string[] = []
  if (!draft.number.trim() || draft.number.length > 40) errors.push('Invoice number required')
  if (!isValidISODate(draft.date)) errors.push('Valid date required')
  if (!draft.customer.trim() || draft.customer.length > 120) errors.push('Customer required')
  if (draft.items.length === 0 || draft.items.length > 100) errors.push('1 to 100 items required')
  let totalPaise = 0
  const linePaise = draft.items.map((line, index) => {
    // Only canonical decimal integers are quantities. Number() also accepts hex,
    // exponent notation and whitespace, which must not enter financial records.
    const quantitySyntaxValid = /^[1-9]\d*$/.test(line.quantity)
    const qty = quantitySyntaxValid ? Number(line.quantity) : NaN
    const unitPaise = decimalToPaise(line.rate)
    if (!line.description.trim() || line.description.length > 300 || !Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty) || unitPaise === null) {
      errors.push(`Invalid line ${index + 1}`)
      return 0
    }
    const subtotal = qty * unitPaise
    if (!Number.isSafeInteger(subtotal) || subtotal > MAX_LINE_PAISE) {
      errors.push(`Line ${index + 1} exceeds limit`)
      return 0
    }
    totalPaise += subtotal
    return subtotal
  })
  if (!Number.isSafeInteger(totalPaise) || totalPaise > MAX_TOTAL_PAISE) errors.push('Invoice total exceeds limit')
  if (totalPaise <= 0) errors.push('Invoice total must be positive')
  return { valid: errors.length === 0, totalPaise, linePaise, errors }
}
