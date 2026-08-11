export type IpoMarketSegment = 'mainboard' | 'sme' | 'unknown'
export type IpoDocumentStage =
  | 'drhp'
  | 'rhp'
  | 'prospectus'
  | 'addendum'
  | 'corrigendum'
  | 'other'

export type IpoLifecycleStatus =
  | 'draft'
  | 'upcoming'
  | 'open'
  | 'closed'
  | 'listed'
  | 'withdrawn'
  | 'unknown'

export type IpoSource = {
  label: string
  url: string
  checkedAt: string
  sourceType: 'SEBI' | 'NSE' | 'BSE' | 'Issuer' | 'Registrar' | 'Other'
}

export type IpoFinancialPeriod = {
  period: string
  revenueCr?: number
  ebitdaCr?: number
  patCr?: number
  netWorthCr?: number
  totalDebtCr?: number
  cfoCr?: number
}

export type IpoValuation = {
  marketCapAtUpperBandCr?: number
  peAtUpperBand?: number
  peerMedianPe?: number
  pbAtUpperBand?: number
  peerMedianPb?: number
}

export type IpoQualityMetrics = {
  roePercent?: number
  rocePercent?: number
  debtEquity?: number
  cfoPat?: number
  topCustomerRevenuePercent?: number
  promoterPledgePercent?: number
  contingentLiabilitiesCr?: number
  relatedPartyTransactionsCr?: number
  materialLitigationCount?: number
}

export type IpoIssueStructure = {
  issueSizeCr?: number
  freshIssueCr?: number
  ofsCr?: number
  priceBandLow?: number
  priceBandHigh?: number
  lotSize?: number
  faceValue?: number
  preIssuePromoterHoldingPercent?: number
  postIssuePromoterHoldingPercent?: number
  openDate?: string
  closeDate?: string
  allotmentDate?: string
  listingDate?: string
  exchange?: string[]
  registrar?: string
  leadManagers?: string[]
  useOfProceeds?: string[]
}

export type IpoSubscription = {
  updatedAt?: string
  qib?: number
  nii?: number
  retail?: number
  employee?: number
  total?: number
  sourceUrl?: string
}

export type VerifiedIpoRecord = {
  slug: string
  companyName: string
  marketSegment: IpoMarketSegment
  status: IpoLifecycleStatus
  sector?: string
  industry?: string
  summary?: string
  issue: IpoIssueStructure
  financials: IpoFinancialPeriod[]
  valuation?: IpoValuation
  quality?: IpoQualityMetrics
  subscription?: IpoSubscription
  riskFlags?: string[]
  sources: IpoSource[]
  lastVerified: string
}

export type IpoDiscoveryRecord = {
  id: string
  companyName: string
  filingTitle: string
  filingDate: string
  documentStage: IpoDocumentStage
  documentUrl?: string
  sourceUrl: string
  firstSeen: string
  lastSeen: string
}
