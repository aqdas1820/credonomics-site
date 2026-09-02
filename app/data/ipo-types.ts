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
  | 'closing_today'
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
  biddingEndAt?: string
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
  sNii?: number
  bNii?: number
  retail?: number
  employee?: number
  shareholder?: number
  total?: number
  sourceUrl?: string
}

export type IpoReservation = {
  qibPercent?: number
  anchorPercent?: number
  niiPercent?: number
  retailPercent?: number
  employeePercent?: number
  shareholderPercent?: number
}

export type IpoApplication = {
  retailMinLots?: number
  retailMinShares?: number
  retailMinAmount?: number
  retailMaxLots?: number
  retailMaxShares?: number
  retailMaxAmount?: number
  sNiiMinLots?: number
  sNiiMinShares?: number
  sNiiMinAmount?: number
  bNiiMinLots?: number
  bNiiMinShares?: number
  bNiiMinAmount?: number
}

export type IpoAnchor = {
  bidDate?: string
  amountCr?: number
  shares?: number
  lockIn50PercentEndDate?: string
  lockInRemainingEndDate?: string
}

export type IpoListing = {
  finalIssuePrice?: number
  nseSymbol?: string
  bseCode?: string
  isin?: string
  openPrice?: number
  highPrice?: number
  lowPrice?: number
  closePrice?: number
}

export type IpoCompanyProfile = {
  promoters?: string[]
  website?: string
  employeeCount?: number
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
  reservation?: IpoReservation
  application?: IpoApplication
  anchor?: IpoAnchor
  listing?: IpoListing
  company?: IpoCompanyProfile
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


export type IpoMarketRecord = {
  slug: string
  companyName: string
  symbol?: string
  marketSegment: IpoMarketSegment
  status: IpoLifecycleStatus
  securityType?: string
  issue: IpoIssueStructure
  subscription?: IpoSubscription
  sharesOffered?: number
  sharesBid?: number
  estimatedIssueValueCr?: number
  marketSource: 'NSE' | 'BSE' | 'NSE+BSE'
  sourceUrl: string
  issueInfoUrl?: string
  fetchedAt: string
}

export type PublicIpoResearchState = 'exchange-live' | 'normalized'

export type PublicIpoRecord = {
  exchangeId?: string
  isin?: string
  slug: string
  companyName: string
  symbol?: string
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
  reservation?: IpoReservation
  application?: IpoApplication
  anchor?: IpoAnchor
  listing?: IpoListing
  company?: IpoCompanyProfile
  riskFlags?: string[]
  sources: IpoSource[]
  lastUpdated: string
  providerUpdatedAt: string
  normalizedAt: string
  provider: string
  researchState: PublicIpoResearchState
  sharesOffered?: number
  sharesBid?: number
  estimatedIssueValueCr?: number
}
