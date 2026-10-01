/** Event dates are source dates, never observation/retrieval clock substitutes. */
export function eventDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const time = Date.parse(value)
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? value : null
}
export function indiaDate(now: Date): string {
  return new Date(now.getTime() + 330 * 60_000).toISOString().slice(0, 10)
}
export const priceTypes = new Set(['price_above', 'price_below', 'percent_rise', 'percent_fall', '52_week_high', '52_week_low'])
export function cooldownElapsed(until: unknown, now: Date): boolean {
  return until === null || until === undefined || typeof until === 'string' && Number.isFinite(Date.parse(until)) && Date.parse(until) <= now.getTime()
}
export function priceEventKey(id: string, now: Date) { return `price_${id}_${indiaDate(now)}` }
const corporateTypes = new Set(['dividend', 'bonus', 'split', 'buyback', 'rights', 'earnings'])
export type NormalizedEvent = { key: string; type: string; exDate: string; description: string; amount: number | null }
export function corporateEvents(instrumentKey: string, data: unknown): NormalizedEvent[] {
  if (!Array.isArray(data)) return []
  const events = new Map<string, NormalizedEvent>()
  for (const raw of data) {
    if (!raw || typeof raw !== 'object' || typeof raw.type !== 'string') continue
    const type = raw.type.trim().toLowerCase()
    const date = eventDate(raw.exDate)
    if (!corporateTypes.has(type) || !date) continue
    // Stable provider-independent identity: instrument + exact event kind + source date.
    const key = `event_${instrumentKey}_${type}_${date}`
    const event = { key, type, exDate: date, description: typeof raw.description === 'string' ? raw.description : type, amount: typeof raw.amount === 'number' && Number.isFinite(raw.amount) ? raw.amount : null }
    const previous = events.get(key)
    if (!previous || JSON.stringify(event) < JSON.stringify(previous)) events.set(key, event)
  }
  return [...events.values()].sort((a, b) => a.exDate.localeCompare(b.exDate) || a.key.localeCompare(b.key))
}
export function ipoMilestone(key: string, type: string, ipo: Record<string, unknown>, now: Date) {
  const field = ({ ipo_open: 'open_date', ipo_close: 'close_date', ipo_listing: 'listing_date' } as Record<string, string>)[type]
  const date = field ? eventDate(ipo[field]) : null
  return date && date === indiaDate(now) ? { date, key: `ipo_${key}_${type}_${date}` } : null
}
