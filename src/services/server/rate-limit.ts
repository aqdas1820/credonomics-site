/**
 * In-memory throttling is scoped to a single serverless/Edge isolate.
 * Shared Vercel firewall limits are still recommended for production.
 */
const buckets = new Map<string, { count: number; reset: number }>()
let calls = 0
const MAX_BUCKETS = 8192

export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now()
  if (++calls % 512 === 0) {
    for (const [id, entry] of buckets) if (entry.reset <= now) buckets.delete(id)
  }
  const old = buckets.get(key)
  const bucket = !old || old.reset <= now ? { count: 0, reset: now + windowMs } : old
  bucket.count += 1
  buckets.set(key, bucket)
  if (buckets.size > MAX_BUCKETS) {
    for (const [id, entry] of buckets) if (entry.reset <= now) buckets.delete(id)
    while (buckets.size > MAX_BUCKETS) {
      const first = buckets.keys().next().value
      if (!first) break
      buckets.delete(first)
    }
  }
  return bucket.count <= limit
}
