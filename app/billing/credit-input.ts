import { z } from 'zod'

const bookedCredit = z.object({
  utr: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{8,80}$/),
  amountPaise: z.number().int().positive().max(10_000_000_000),
  bookedAt: z.string().datetime({ offset: true }),
  evidenceReference: z.string().trim().min(1).max(500),
  confirmedBookedInSlice: z.literal(true),
}).strict()

/** Operator attests to independent bank-statement verification, NOT a gateway callback. */
export function prepareBookedCredit(input: unknown) {
  const result = bookedCredit.safeParse(input)
  if (!result.success) throw new Error('Invalid bank-credit evidence')
  if (Date.parse(result.data.bookedAt) > Date.now() + 60_000) throw new Error('Future bank credit')
  return result.data
}
