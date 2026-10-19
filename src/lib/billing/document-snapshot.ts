import { z } from 'zod'
import { isValidStoredPaidReceipt } from '../../../app/billing/receipt-policy'

export const documentId = z.string().uuid().transform(s => s.toLowerCase())
export const documentKind = z.enum(['invoice', 'receipt'])
const money = z.number().int().safe().min(0).max(10_000_000_000)
const text = (max: number) => z.string().min(1).max(max).refine(s => !/[\u0000-\u0008\u000b-\u001f\u007f]/.test(s))
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => {
  const d = new Date(s + 'T00:00:00Z')
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s
})
const instant = z.string().max(40).datetime({ offset: true })
const number = z.string().regex(/^CN-\d{4}-\d{8}$/)
const line = z.object({ position: z.number().int().min(0).max(99), description: text(300),
  quantity: z.number().int().min(1).max(2147483647), ratePaise: money, lineTotalPaise: money })
const invoice = z.object({ id: documentId, invoiceNumber: number, customer: text(120),
  address: z.string().max(300).refine(s => !/[\u0000-\u0008\u000b-\u001f\u007f]/.test(s)), date,
  totalPaise: money.positive(), items: z.array(line).min(1).max(100) })
const receipt = z.object({ invoiceId: documentId, invoiceNumber: number,
  receiptNumber: z.string().regex(/^CN-R-\d{4}-\d{8}$/), invoiceDate: date, issuedAt: instant,
  customer: text(120), version: z.literal(1), status: z.literal('PAID'),
  totalPaise: money.positive(), paidPaise: money.positive(),
  verifiedCredits: z.array(z.object({ utr: z.string().regex(/^[A-Z0-9-]{8,80}$/), amountPaise: money.positive(), bookedAt: instant })).min(1).max(1000) })
export type DocumentSnapshot = { kind: 'invoice'; version: 1; data: z.infer<typeof invoice> } |
  { kind: 'receipt'; version: 1; data: z.infer<typeof receipt> }

/** Pick immutable original fields; never archive changing invoice payment status. */
export function parseDocumentSnapshot(kind: 'invoice' | 'receipt', input: unknown, id: string): DocumentSnapshot {
  const expected = documentId.parse(id)
  if (kind === 'invoice') {
    const data = invoice.parse(input)
    if (data.id !== expected || data.items.some((l, i) => l.position !== i || l.quantity * l.ratePaise !== l.lineTotalPaise) ||
        data.items.reduce((sum, l) => sum + l.lineTotalPaise, 0) !== data.totalPaise) throw new Error('Invalid immutable invoice')
    return { kind, version: 1, data }
  }
  const data = receipt.parse(input)
  if (data.invoiceId !== expected || !isValidStoredPaidReceipt(data)) throw new Error('Invalid verified receipt')
  return { kind, version: 1, data }
}

export function snapshotId(s: DocumentSnapshot) { return s.kind === 'invoice' ? s.data.id : s.data.invoiceId }
export function documentKey(s: DocumentSnapshot) { return `${snapshotId(s)}/${s.kind}-v${s.version}.json` }
