// Per-process protection; use a shared store for deployment-wide limits.
const buckets = new Map<string, { count: number; reset: number }>()
export function rateLimit(key: string, limit: number, windowMs = 60_000) {
  const now = Date.now()
  for (const [id, bucket] of buckets) if (bucket.reset <= now) buckets.delete(id)
  const old = buckets.get(key)
  if (!old && buckets.size >= 10_000) return false
  const bucket = old ?? { count: 0, reset: now + windowMs }
  bucket.count += 1
  buckets.set(key, bucket)
  return bucket.count <= limit
}
