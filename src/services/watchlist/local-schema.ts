import { z } from 'zod'
const instrument = z.object({ instrumentKey: z.string().min(1), symbol: z.string().min(1), exchange: z.enum(['NSE', 'BSE']), companyName: z.string() })
const alert = instrument.extend({ id: z.string(), ownerId: z.string(), type: z.enum(['price_above', 'price_below', 'percent_rise', 'percent_fall', '52_week_high', '52_week_low', 'volume_spike']), threshold: z.number().finite().nullable(), status: z.enum(['active', 'paused', 'triggered']), createdAt: z.string(), triggeredAt: z.string().nullable() })
export const localWorkspaceSchema = z.object({
  version: z.literal(1), ownerId: z.string(),
  watchlists: z.array(z.object({ id: z.string(), ownerId: z.string(), name: z.string(), items: z.array(instrument.extend({ addedAt: z.string() })), createdAt: z.string(), order: z.number().finite() })).min(1),
  alerts: z.array(alert),
  notifications: z.array(z.object({ id: z.string(), ownerId: z.string(), alertId: z.string(), title: z.string(), message: z.string(), createdAt: z.string(), readAt: z.string().nullable() })),
})
