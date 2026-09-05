export type IpoDisplayStatus =
  | 'draft'
  | 'upcoming'
  | 'open'
  | 'closing_today'
  | 'closed'
  | 'listed'
  | 'withdrawn'
  | 'unknown'

export type IpoStatusInput = {
  openDate?: string | null
  closeDate?: string | null
  biddingEndAt?: string | null
  listingDate?: string | null
  providerStatus?: string | null
}

export const IPO_TIME_ZONE = 'Asia/Kolkata'
export const DEFAULT_IPO_BIDDING_CUTOFF_IST = '17:00:00'

function istDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IPO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

function dateKey(value?: string | null) {
  if (!value) return null
  const iso = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : istDateKey(parsed)
}

function instant(value?: string | null) {
  if (!value || !/[T ]\d{1,2}:\d{2}/.test(value)) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function fallbackCutoff(closeDate: string) {
  return new Date(`${closeDate}T${DEFAULT_IPO_BIDDING_CUTOFF_IST}+05:30`)
}

function providerFallback(value?: string | null): IpoDisplayStatus {
  const status = value?.trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (status === 'withdrawn') return 'withdrawn'
  if (status === 'draft' || status === 'filed' || status === 'research') return 'draft'
  if (status === 'upcoming') return 'upcoming'
  if (status === 'open') return 'open'
  if (status === 'closed') return 'closed'
  return 'unknown'
}

export function getIpoDisplayStatus(
  input: IpoStatusInput,
  now = new Date(),
): IpoDisplayStatus {
  const today = istDateKey(now)
  const openDate = dateKey(input.openDate)
  const closeDate = dateKey(input.closeDate)
  const listingDate = dateKey(input.listingDate)

  if (listingDate && today >= listingDate) return 'listed'
  if (openDate && today < openDate) return 'upcoming'

  if (closeDate) {
    if (today > closeDate) return 'closed'
    if (today === closeDate) {
      const cutoff = instant(input.biddingEndAt) ?? fallbackCutoff(closeDate)
      return now < cutoff ? 'closing_today' : 'closed'
    }
    if (!openDate || today >= openDate) return 'open'
  }

  return providerFallback(input.providerStatus)
}

export function ipoStatusLabel(status: IpoDisplayStatus) {
  if (status === 'closing_today') return 'Closing today'
  if (status === 'upcoming') return 'Upcoming'
  if (status === 'open') return 'Open'
  if (status === 'closed') return 'Recently Closed'
  if (status === 'listed') return 'Listed'
  if (status === 'withdrawn') return 'Withdrawn'
  if (status === 'draft') return 'Filed / RHP'
  return 'Status pending'
}
