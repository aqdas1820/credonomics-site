export function calendarComparisonMonth(current: string, period: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(current)) return ''
  const step = Number(period.replace('M', ''))
  if (!Number.isInteger(step) || step < 1 || step > 12) return ''
  const [year, month] = current.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1 - step, 1))
  return date.toISOString().slice(0, 7)
}

/** A missing month, incomplete cohort or unverified identity is not a zero holding. */
export function comparableSnapshots(current: Array<{ scheme: string; isin?: string | null }>, previous: Array<{ scheme: string; isin?: string | null }>, selectedScheme: string) {
  const scope = (rows: typeof current) => rows.filter(h => selectedScheme === 'All Core Schemes' || h.scheme === selectedScheme)
  const a = scope(current), b = scope(previous)
  if (!a.length || !b.length || [...a, ...b].some(h => !/^IN[A-Z0-9]{10}$/.test(h.isin ?? ''))) return false
  const cohort = (rows: typeof current) => [...new Set(rows.map(h => h.scheme))].sort().join('|')
  return cohort(a) === cohort(b)
}
