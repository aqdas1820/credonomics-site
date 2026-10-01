export function boundedNumber(value: string | null, fallback: number, maximum = 1e12): number {
  if (value === null || !value.trim()) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(0, parsed)) : fallback
}
