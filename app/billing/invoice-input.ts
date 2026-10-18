import { z } from 'zod'
import { calculateInvoice } from './invoice-math'

const createSchema = z.object({
  date: z.string(),
  customer: z.string().trim().min(1).max(120),
  address: z.string().trim().max(300).optional(),
  customerPhone: z.string().regex(/^\+[1-9]\d{6,14}$/).optional(),
  items: z.array(z.object({
    description: z.string().trim().min(1).max(300),
    quantity: z.string(),
    rate: z.string(),
  }).strict()).min(1).max(100),
}).strict()

/** Parse untrusted requests; invoice number/price/status are never accepted from the client. */
export function prepareInvoiceCreation(input: unknown) {
  const parsed = createSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid invoice fields')
  const draft = parsed.data
  const amounts = calculateInvoice({
    number: 'SERVER_ALLOCATED', date: draft.date, customer: draft.customer, items: draft.items,
  })
  if (!amounts.valid) throw new Error(amounts.errors.join('; '))
  const lines = draft.items.map((item, position) => {
    const quantity = Number(item.quantity)
    const ratePaise = amounts.linePaise[position] / quantity
    if (!Number.isSafeInteger(ratePaise)) throw new Error('Invalid unit price')
    return {
      position, description: item.description, quantity,
      rate_paise: ratePaise, line_total_paise: amounts.linePaise[position],
    }
  })
  return {
    customerName: draft.customer, customerAddress: draft.address ?? '', issuedOn: draft.date,
    customerPhone: draft.customerPhone ?? null,
    totalPaise: amounts.totalPaise, lines,
  }
}
