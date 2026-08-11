import type { IpoFinancialPeriod, VerifiedIpoRecord } from './ipo-types'

export type IpoScoreComponent = {
  key: string
  label: string
  weight: number
  available: boolean
  raw?: number
  earned: number
  note: string
}

export type IpoDataScore = {
  score: number | null
  coverage: number
  label: string
  components: IpoScoreComponent[]
  revenueCagr?: number
  patCagr?: number
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function cagr(start?: number, end?: number, periods?: number) {
  if (
    start === undefined ||
    end === undefined ||
    periods === undefined ||
    periods <= 0 ||
    start <= 0 ||
    end <= 0
  ) return undefined

  return (Math.pow(end / start, 1 / periods) - 1) * 100
}

function availableFinancials(financials: IpoFinancialPeriod[]) {
  return financials
    .filter((period) => period.period)
    .slice()
}

function growthFactor(value: number) {
  if (value <= 0) return 0
  if (value < 5) return .2
  if (value < 10) return .4
  if (value < 20) return .7
  if (value < 30) return .9
  return 1
}

function qualityFactor(value: number) {
  if (value < 5) return .15
  if (value < 10) return .4
  if (value < 15) return .65
  if (value < 20) return .82
  return 1
}

function cashFactor(value: number) {
  if (value <= 0) return 0
  if (value < .5) return .35
  if (value < .8) return .6
  if (value < 1) return .8
  return 1
}

function leverageFactor(value: number) {
  if (value <= .2) return 1
  if (value <= .5) return .85
  if (value <= 1) return .65
  if (value <= 1.5) return .4
  return .15
}

function relativeValuationFactor(multiple: number, peer: number) {
  if (multiple <= 0 || peer <= 0) return 0
  const ratio = multiple / peer
  if (ratio <= .75) return 1
  if (ratio <= 1) return .85
  if (ratio <= 1.2) return .65
  if (ratio <= 1.5) return .4
  return .15
}

function freshIssueFactor(value: number) {
  if (value >= 70) return 1
  if (value >= 50) return .85
  if (value >= 30) return .65
  if (value >= 10) return .4
  return .2
}

function ofsFactor(value: number) {
  if (value <= 20) return 1
  if (value <= 40) return .8
  if (value <= 60) return .55
  if (value <= 80) return .3
  return .1
}

function concentrationFactor(value: number) {
  if (value <= 10) return 1
  if (value <= 20) return .8
  if (value <= 35) return .55
  if (value <= 50) return .3
  return .1
}

function component(
  key: string,
  label: string,
  weight: number,
  value: number | undefined,
  factor: ((value: number) => number),
  note: string,
): IpoScoreComponent {
  const available = value !== undefined && Number.isFinite(value)
  return {
    key,
    label,
    weight,
    available,
    raw: available ? value : undefined,
    earned: available ? clamp(factor(value!)) * weight : 0,
    note,
  }
}

export function calculateIpoDataScore(record: VerifiedIpoRecord): IpoDataScore {
  const periods = availableFinancials(record.financials)
  const first = periods[0]
  const last = periods[periods.length - 1]
  const years = Math.max(1, periods.length - 1)

  const revenueCagr = cagr(first?.revenueCr, last?.revenueCr, years)
  const patCagr = cagr(first?.patCr, last?.patCr, years)

  const q = record.quality || {}
  const v = record.valuation || {}
  const issue = record.issue || {}

  const issueSize = issue.issueSizeCr
  const freshShare =
    issueSize && issueSize > 0 && issue.freshIssueCr !== undefined
      ? (issue.freshIssueCr / issueSize) * 100
      : undefined
  const ofsShare =
    issueSize && issueSize > 0 && issue.ofsCr !== undefined
      ? (issue.ofsCr / issueSize) * 100
      : undefined

  const peRelative =
    v.peAtUpperBand !== undefined && v.peerMedianPe !== undefined
      ? relativeValuationFactor(v.peAtUpperBand, v.peerMedianPe)
      : undefined

  const pbRelative =
    v.pbAtUpperBand !== undefined && v.peerMedianPb !== undefined
      ? relativeValuationFactor(v.pbAtUpperBand, v.peerMedianPb)
      : undefined

  const components: IpoScoreComponent[] = [
    component('revenue-growth', 'Revenue CAGR', 12, revenueCagr, growthFactor, 'Three-period revenue growth where sufficient history exists.'),
    component('pat-growth', 'PAT CAGR', 12, patCagr, growthFactor, 'Three-period profit-after-tax growth where positive history exists.'),
    component('roe', 'ROE', 10, q.roePercent, qualityFactor, 'Latest normalized return on equity.'),
    component('roce', 'ROCE', 10, q.rocePercent, qualityFactor, 'Latest normalized return on capital employed.'),
    component('cash-conversion', 'CFO / PAT', 12, q.cfoPat, cashFactor, 'Operating-cash-flow conversion relative to PAT.'),
    component('leverage', 'Debt / Equity', 10, q.debtEquity, leverageFactor, 'Lower leverage receives a higher mechanical score.'),
    {
      key: 'pe-relative',
      label: 'P/E vs peer median',
      weight: 14,
      available: peRelative !== undefined,
      raw: v.peAtUpperBand,
      earned: peRelative !== undefined ? peRelative * 14 : 0,
      note: 'IPO P/E at upper band compared with the normalized listed-peer median.',
    },
    {
      key: 'pb-relative',
      label: 'P/B vs peer median',
      weight: 6,
      available: pbRelative !== undefined,
      raw: v.pbAtUpperBand,
      earned: pbRelative !== undefined ? pbRelative * 6 : 0,
      note: 'IPO P/B at upper band compared with the normalized listed-peer median.',
    },
    component('fresh-share', 'Fresh-issue share', 7, freshShare, freshIssueFactor, 'Fresh capital as a percentage of total issue size.'),
    component('ofs-share', 'OFS share', 4, ofsShare, ofsFactor, 'Lower offer-for-sale share receives a higher mechanical score.'),
    component('customer-concentration', 'Top-customer concentration', 3, q.topCustomerRevenuePercent, concentrationFactor, 'Lower disclosed top-customer revenue concentration receives a higher score.'),
  ]

  const availableWeight = components
    .filter((item) => item.available)
    .reduce((sum, item) => sum + item.weight, 0)

  const earned = components.reduce((sum, item) => sum + item.earned, 0)
  const coverage = availableWeight
  const score = availableWeight >= 50 ? Math.round((earned / availableWeight) * 100) : null

  const label =
    score === null
      ? 'Insufficient normalized data'
      : score >= 80
        ? 'High quantitative data score'
        : score >= 65
          ? 'Above-mid quantitative data score'
          : score >= 50
            ? 'Mid quantitative data score'
            : 'Low quantitative data score'

  return {
    score,
    coverage,
    label,
    components,
    revenueCagr,
    patCagr,
  }
}
