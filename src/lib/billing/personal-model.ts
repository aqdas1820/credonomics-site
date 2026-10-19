import { z } from 'zod'
import { calculateInvoice, type InvoiceLine } from '../../../app/billing/invoice-math'

export const testStatuses = ['DRAFT', 'ISSUED_TEST', 'SIMULATED_PENDING', 'SIMULATED_SUCCESS', 'SIMULATED_FAILURE', 'SIMULATED_REFUND'] as const
const item = z.object({ description: z.string().trim().min(1).max(300), quantity: z.string().max(10), rate: z.string().max(14) }).strict()
export const testDraft = z.object({ customer: z.string().trim().min(1).max(120), date: z.string().length(10), items: z.array(item).min(1).max(20) }).strict()
const event = z.object({ status: z.enum(testStatuses), at: z.string().datetime() }).strict()
export const testRecord = testDraft.extend({ id: z.string().uuid(), number: z.string().regex(/^TEST-\d{4}-\d{5}$/),
  kind: z.literal('TEST'), realSettlement: z.literal('NONE'), status: z.enum(testStatuses),
  totalPaise: z.number().int().positive().max(10_000_000_000), events: z.array(event).min(1).max(20) }).strict()
export const testLedger = z.object({ version: z.literal(1), owner: z.string().uuid(), revision: z.number().int().nonnegative(),
  records: z.array(testRecord).max(50) }).strict()
export type TestRecord = z.infer<typeof testRecord>
export type TestLedger = z.infer<typeof testLedger>
export const commandSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('read') }).strict(),
  z.object({ action: z.literal('save'), id: z.string().uuid().optional(), draft: testDraft }).strict(),
  z.object({ action: z.literal('transition'), id: z.string().uuid(), status: z.enum(testStatuses) }).strict(),
  z.object({ action: z.literal('pdf'), id: z.string().uuid() }).strict(),
])
export type TestCommand = z.infer<typeof commandSchema>
const allowed: Record<TestRecord['status'], readonly TestRecord['status'][]> = {
  DRAFT: ['ISSUED_TEST'], ISSUED_TEST: ['SIMULATED_PENDING'], SIMULATED_PENDING: ['SIMULATED_SUCCESS', 'SIMULATED_FAILURE'],
  SIMULATED_SUCCESS: ['SIMULATED_REFUND'], SIMULATED_FAILURE: ['SIMULATED_PENDING'], SIMULATED_REFUND: [],
}
export function amountFor(draft: { customer: string; date: string; items: InvoiceLine[] }) {
  const result = calculateInvoice({ ...draft, number: 'TEST' })
  if (!result.valid) throw new Error('Check customer, date, quantities and prices (maximum two decimal places).')
  return result
}
export function validateLedger(value: unknown, owner: string): TestLedger {
  const ledger = testLedger.parse(value)
  if (ledger.owner !== owner || new Set(ledger.records.map(x => x.id)).size !== ledger.records.length ||
    new Set(ledger.records.map(x => x.number)).size !== ledger.records.length) throw new Error('Invalid TEST workspace')
  for (const record of ledger.records) {
    if (amountFor(record).totalPaise !== record.totalPaise || record.events.at(-1)?.status !== record.status) throw new Error('Invalid TEST record')
  }
  return ledger
}
export function applyTestCommand(ledger: TestLedger, input: unknown, id: string, now: string): TestLedger {
  const command = commandSchema.parse(input)
  const next = structuredClone(ledger)
  if (command.action === 'read' || command.action === 'pdf') return next
  if (command.action === 'save') {
    const totalPaise = amountFor(command.draft).totalPaise
    if (command.id) {
      const record = next.records.find(x => x.id === command.id)
      if (!record || record.status !== 'DRAFT') throw new Error('Only TEST drafts can be edited')
      Object.assign(record, command.draft, { totalPaise })
    } else {
      if (next.records.length >= 50) throw new Error('This browser workspace holds at most 50 TEST invoices')
      next.records.unshift({ ...command.draft, id, number: `TEST-${now.slice(0, 4)}-${String(next.records.length + 1).padStart(5, '0')}`,
        kind: 'TEST', realSettlement: 'NONE', status: 'DRAFT', totalPaise, events: [{ status: 'DRAFT', at: now }] })
    }
  } else {
    const record = next.records.find(x => x.id === command.id)
    if (!record || !allowed[record.status].includes(command.status) || record.events.length >= 20) throw new Error('Invalid TEST lifecycle transition')
    record.status = command.status; record.events.push({ status: command.status, at: now })
  }
  next.revision++
  return validateLedger(next, ledger.owner)
}
export const inr = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100)
