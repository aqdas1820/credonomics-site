export type CardCategory =
  | 'online'
  | 'groceries'
  | 'dining'
  | 'travel'
  | 'fuel'
  | 'utilities'
  | 'other'

export type CardSource = {
  label: string
  url: string
  checkedAt: string
  effectiveDate?: string
}

export type RewardRule = {
  category: CardCategory
  ratePercent: number
  monthlyCapRupees?: number
}

export type VerifiedCard = {
  slug: string
  issuer: string
  productName: string
  status: 'verified'
  network?: string
  annualFeeRupees: number
  annualFeeTaxRatePercent: number
  feeWaiverAnnualSpendRupees?: number
  baseRewardRatePercent: number
  categoryRules: RewardRule[]
  exclusions: string[]
  forexMarkupPercent?: number
  fuelSurchargeWaiver?: {
    ratePercent: number
    minTransactionRupees?: number
    maxTransactionRupees?: number
    monthlyCapRupees?: number
  }
  loungeNotes?: string[]
  milestoneBenefits?: string[]
  officialSources: CardSource[]
  lastVerified: string
}

// Production rule:
// Add a card here only after current official issuer documentation has been
// checked and the record contains source links + a lastVerified date.
export const verifiedCards: VerifiedCard[] = []

export const cardDatabaseStatus = {
  publicVerifiedRecords: verifiedCards.length,
  policy: 'Source-backed records only',
  engineStatus: 'Custom analyzer live',
}
