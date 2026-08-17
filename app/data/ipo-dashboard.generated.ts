export type IPODashboardRecord = {
  id: string
  slug: string
  company: string
  board: 'Mainboard' | 'SME'
  status: string
  openDate: string
  closeDate: string
  listingDate: string
  allotmentDate: string
  priceBand: string
  lotSize: string
  issueSize: string
  exchange: string
  gmp: string
  subscription: string
  href: string
  sourceFile: string
}

export type IPONavigationItem = {
  label: string
  href: string
  key: string
}

export const ipoDashboardRecords: readonly IPODashboardRecord[] =
  []

export const ipoNavigation: readonly IPONavigationItem[] =
  [
  {
    "label": "Current IPOs",
    "href": "/ipo/current",
    "key": "current"
  },
  {
    "label": "Upcoming IPOs",
    "href": "/ipo/upcoming",
    "key": "upcoming"
  },
  {
    "label": "IPO Calendar",
    "href": "/ipo/calendar",
    "key": "calendar"
  },
  {
    "label": "Subscription",
    "href": "/ipo/subscription",
    "key": "subscription"
  },
  {
    "label": "Mainboard",
    "href": "/ipo/mainboard",
    "key": "mainboard"
  },
  {
    "label": "SME IPOs",
    "href": "/ipo/sme",
    "key": "sme"
  },
  {
    "label": "IPO Analyzer",
    "href": "/ipo/analyzer",
    "key": "analyzer"
  },
  {
    "label": "Documents",
    "href": "/ipo/documents",
    "key": "documents"
  },
  {
    "label": "Methodology",
    "href": "/ipo/methodology",
    "key": "methodology"
  }
]
