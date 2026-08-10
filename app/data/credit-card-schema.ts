export type SourceRecord = {
  label: string
  url: string
  effectiveDate?: string
  checkedAt: string
}

export type CreditCardRecord = {
  id: string
  issuer: string
  productName: string
  network?: string
  joiningFeeRupees?: number
  annualFeeRupees?: number
  annualFeeTaxRate?: number
  waiverSpendRupees?: number
  baseRewardRate?: number
  acceleratedCategories?: Array<{
    category: string
    rewardRate: number
    capRupees?: number
    capPeriod?: 'month' | 'quarter' | 'year'
  }>
  exclusions?: string[]
  lounge?: string[]
  fuelSurchargeWaiver?: {
    ratePercent?: number
    minimumTransaction?: number
    maximumTransaction?: number
    capRupees?: number
    capPeriod?: 'month' | 'quarter' | 'year'
  }
  forexMarkupPercent?: number
  milestoneBenefits?: string[]
  sources: SourceRecord[]
  lastVerified: string
}

// Production rule: do not publish a product record until current official
// source documents and a lastVerified date are attached to it.
export const verifiedCreditCards: CreditCardRecord[] = []
