const unavailable = '—'

function finiteNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return undefined
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  const parsed = Number(value.replace(/[,×x]/gi, '').trim())
  return Number.isFinite(parsed) ? parsed : undefined
}

export function formatSubscription(value: number | string | null | undefined) {
  const numeric = finiteNumber(value)
  if (numeric === undefined) return unavailable
  return `${numeric.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}×`
}

export function formatIpoDate(value: string | null | undefined) {
  if (!value) return unavailable
  const date = new Date(`${value.slice(0, 10)}T00:00:00+05:30`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date).replace('Sept', 'Sep')
}

export function formatShortIpoDate(value: string | null | undefined) {
  if (!value) return unavailable
  const date = new Date(`${value.slice(0, 10)}T00:00:00+05:30`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date).replace('Sept', 'Sep')
}
