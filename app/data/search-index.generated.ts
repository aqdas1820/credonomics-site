export type SearchEntry = {
  id: string
  title: string
  description: string
  href: string
  category: string
  source: string
  updated: string
  keywords: string
  priority: number
}

export const searchIndex: readonly SearchEntry[] = [
  {
    "id": "route:/",
    "title": "Financial Research & Frameworks",
    "description": "Explore Financial Research & Frameworks on CredoNomics Investment Solutions.",
    "href": "/",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "Financial Research & Frameworks Platform",
    "priority": 100
  },
  {
    "id": "route:/discover",
    "title": "Intelligence Discovery",
    "description": "Discover CredoNomics research reports, IPO intelligence, mutual-fund portfolio research, card intelligence and financial tools.",
    "href": "/discover",
    "category": "Discovery",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "discover Intelligence Discovery Discovery",
    "priority": 99
  },
  {
    "id": "report:monthly-indian-equity-opportunity-report-august-2026",
    "title": "Monthly Indian Equity Opportunity Report - August 2026",
    "description": "A 26-page monthly market-strategy publication covering 12 priority research ideas, event windows, ownership signals, catalyst checkpoints, risk controls and explicit thesis invalidation rules.",
    "href": "/reports/monthly-indian-equity-opportunity-report-august-2026",
    "category": "Reports",
    "source": "CredoNomics publication",
    "updated": "16 August 2026",
    "keywords": "Monthly Indian Equity Opportunity Report monthly-indian-equity-opportunity-report-august-2026 Reports",
    "priority": 97
  },
  {
    "id": "route:/reports",
    "title": "Research Reports",
    "description": "Public CredoNomics research publications with issue dates, data cut-offs, methodology context and downloadable source documents.",
    "href": "/reports",
    "category": "Reports",
    "source": "CredoNomics publication",
    "updated": "",
    "keywords": "reports Research Reports Reports",
    "priority": 96
  },
  {
    "id": "route:/mutual-funds",
    "title": "Mutual Fund Intelligence",
    "description": "Explore CredoNomics mutual-fund portfolio intelligence, scheme holdings, monthly portfolio changes, methodology and source-aware research workflows.",
    "href": "/mutual-funds",
    "category": "Mutual Funds",
    "source": "Portfolio disclosures",
    "updated": "",
    "keywords": "mutual-funds Mutual Fund Intelligence Mutual Funds",
    "priority": 95
  },
  {
    "id": "route:/research",
    "title": "Research Desk",
    "description": "CredoNomics research across equities and valuation, IPOs, mutual funds, banking and cards, supported by transparent methodology and source context.",
    "href": "/research",
    "category": "Research",
    "source": "Research Desk",
    "updated": "",
    "keywords": "research Research Desk Research",
    "priority": 95
  },
  {
    "id": "route:/ipo",
    "title": "IPO Intelligence Dashboard",
    "description": "Track current and upcoming Indian IPOs, Mainboard and SME issues, price bands, important dates and CredoNomics primary-market research.",
    "href": "/ipo",
    "category": "IPO",
    "source": "IPO market records",
    "updated": "",
    "keywords": "ipo IPO Intelligence Dashboard IPO",
    "priority": 94
  },
  {
    "id": "route:/tools/mf-portfolio-tracker",
    "title": "Mutual Fund Portfolio Intelligence | CredoNomics",
    "description": "Track selected HDFC active-equity fund holdings, consensus ownership, accumulation, exits, sector rotation and monthly portfolio changes.",
    "href": "/tools/mf-portfolio-tracker",
    "category": "Mutual Funds",
    "source": "Portfolio disclosures",
    "updated": "",
    "keywords": "tools mf-portfolio-tracker Mutual Fund Portfolio Intelligence | CredoNomics Mutual Funds",
    "priority": 93
  },
  {
    "id": "route:/cards",
    "title": "Compare Indian Credit Cards",
    "description": "Compare real Indian credit cards by cashback, fuel, travel, shopping, UPI, utilities, dining, forex and other categories using transparent annual-value calculations.",
    "href": "/cards",
    "category": "Cards",
    "source": "Issuer terms",
    "updated": "",
    "keywords": "cards Compare Indian Credit Cards Cards",
    "priority": 91
  },
  {
    "id": "route:/tools",
    "title": "Financial Research & Decision Tools",
    "description": "CredoNomics tools for mutual-fund portfolio intelligence, IPO analysis, credit-card economics and practical financial calculations.",
    "href": "/tools",
    "category": "Tools",
    "source": "CredoNomics tools",
    "updated": "",
    "keywords": "tools Financial Research & Decision Tools Tools",
    "priority": 90
  },
  {
    "id": "article:fuel-surcharge-waiver-vs-rewards",
    "title": "Fuel surcharge waiver and fuel rewards are not the same benefit",
    "description": "A framework for separating surcharge mechanics, waiver limits and reward-point value before estimating a fuel card’s real savings.",
    "href": "/research/articles/fuel-surcharge-waiver-vs-rewards",
    "category": "Research",
    "source": "CredoNomics research",
    "updated": "2026-08-10",
    "keywords": "Fuel surcharge waiver and fuel rewards are not the same benefit fuel-surcharge-waiver-vs-rewards Research",
    "priority": 89
  },
  {
    "id": "article:effective-credit-card-reward-rate",
    "title": "How to calculate the effective reward rate of a credit card",
    "description": "A practical framework for moving from an advertised reward rate to the value that can realistically be earned after caps, exclusions and annual costs.",
    "href": "/research/articles/effective-credit-card-reward-rate",
    "category": "Research",
    "source": "CredoNomics research",
    "updated": "2026-08-10",
    "keywords": "How to calculate the effective reward rate of a credit card effective-credit-card-reward-rate Research",
    "priority": 89
  },
  {
    "id": "article:credit-card-annual-fee-break-even",
    "title": "When does a credit-card annual fee actually pay for itself?",
    "description": "Use break-even analysis to compare a paid credit card with a lower-fee or no-fee alternative.",
    "href": "/research/articles/credit-card-annual-fee-break-even",
    "category": "Research",
    "source": "CredoNomics research",
    "updated": "2026-08-10",
    "keywords": "When does a credit-card annual fee actually pay for itself? credit-card-annual-fee-break-even Research",
    "priority": 89
  },
  {
    "id": "article:cashback-cap-math",
    "title": "Why a 5% cashback card may not deliver 5% on your total spending",
    "description": "Understand category eligibility and reward caps before treating a headline cashback rate as the effective rate.",
    "href": "/research/articles/cashback-cap-math",
    "category": "Research",
    "source": "CredoNomics research",
    "updated": "2026-08-10",
    "keywords": "Why a 5% cashback card may not deliver 5% on your total spending cashback-cap-math Research",
    "priority": 89
  },
  {
    "id": "route:/research/credit-card-data-standard",
    "title": "Credit Card Data Standard",
    "description": "The fields and verification rules CredoNomics will use for structured Indian credit-card research.",
    "href": "/research/credit-card-data-standard",
    "category": "Research",
    "source": "Research Desk",
    "updated": "",
    "keywords": "research credit-card-data-standard Credit Card Data Standard Research",
    "priority": 86
  },
  {
    "id": "route:/research/card-scoring",
    "title": "CredoNomics Card Fit Score Methodology",
    "description": "How the CredoNomics custom card analyzer builds its transparent 100-point Fit Score.",
    "href": "/research/card-scoring",
    "category": "Research",
    "source": "Research Desk",
    "updated": "",
    "keywords": "research card-scoring CredoNomics Card Fit Score Methodology Research",
    "priority": 86
  },
  {
    "id": "route:/ipo/current",
    "title": "Current IPOs",
    "description": "Browse current ipos using the CredoNomics exchange market master and normalized IPO research database.",
    "href": "/ipo/current",
    "category": "IPO",
    "source": "IPO market records",
    "updated": "",
    "keywords": "ipo current Current IPOs IPO",
    "priority": 84
  },
  {
    "id": "route:/ipo/calendar",
    "title": "IPO Calendar India",
    "description": "IPO opening, closing, allotment and listing calendar from normalized CredoNomics IPO records.",
    "href": "/ipo/calendar",
    "category": "IPO",
    "source": "IPO market records",
    "updated": "",
    "keywords": "ipo calendar IPO Calendar India IPO",
    "priority": 84
  },
  {
    "id": "route:/ipo/analyzer",
    "title": "IPO Data Score Analyzer",
    "description": "Calculate a transparent quantitative IPO data score using normalized financial, valuation and issue-structure inputs.",
    "href": "/ipo/analyzer",
    "category": "IPO",
    "source": "IPO market records",
    "updated": "",
    "keywords": "ipo analyzer IPO Data Score Analyzer IPO",
    "priority": 84
  },
  {
    "id": "route:/ipo/methodology",
    "title": "IPO Data Score Methodology",
    "description": "How CredoNomics normalizes public-offer financial data and calculates its fixed quantitative IPO Data Score.",
    "href": "/ipo/methodology",
    "category": "IPO",
    "source": "IPO market records",
    "updated": "",
    "keywords": "ipo methodology IPO Data Score Methodology IPO",
    "priority": 84
  },
  {
    "id": "route:/ipo/documents",
    "title": "IPO Offer Documents — DRHP, RHP & Prospectus",
    "description": "Search recent SEBI IPO DRHP, RHP, prospectus, addendum and corrigendum discovery records.",
    "href": "/ipo/documents",
    "category": "IPO",
    "source": "IPO market records",
    "updated": "",
    "keywords": "ipo documents IPO Offer Documents — DRHP, RHP & Prospectus IPO",
    "priority": 84
  },
  {
    "id": "route:/ipo/subscription",
    "title": "IPO Subscription Status",
    "description": "QIB, NII and retail IPO subscription data from normalized source-backed CredoNomics IPO records.",
    "href": "/ipo/subscription",
    "category": "IPO",
    "source": "IPO market records",
    "updated": "",
    "keywords": "ipo subscription IPO Subscription Status IPO",
    "priority": 84
  },
  {
    "id": "route:/ipo/mainboard",
    "title": "Mainboard IPOs",
    "description": "Browse mainboard ipos using the CredoNomics exchange market master and normalized IPO research database.",
    "href": "/ipo/mainboard",
    "category": "IPO",
    "source": "IPO market records",
    "updated": "",
    "keywords": "ipo mainboard Mainboard IPOs IPO",
    "priority": 84
  },
  {
    "id": "route:/ipo/sme",
    "title": "SME IPOs",
    "description": "Browse sme ipos using the CredoNomics exchange market master and normalized IPO research database.",
    "href": "/ipo/sme",
    "category": "IPO",
    "source": "IPO market records",
    "updated": "",
    "keywords": "ipo sme SME IPOs IPO",
    "priority": 84
  },
  {
    "id": "route:/ipo/upcoming",
    "title": "Upcoming IPOs",
    "description": "Browse upcoming ipos using the CredoNomics exchange market master and normalized IPO research database.",
    "href": "/ipo/upcoming",
    "category": "IPO",
    "source": "IPO market records",
    "updated": "",
    "keywords": "ipo upcoming Upcoming IPOs IPO",
    "priority": 84
  },
  {
    "id": "route:/about",
    "title": "About",
    "description": "About CredoNomics Investment Solutions and its financial research and decision-tool mission.",
    "href": "/about",
    "category": "Company",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "about About Company",
    "priority": 60
  },
  {
    "id": "route:/cards/all",
    "title": "All Verified Credit Cards",
    "description": "Browse all real Indian credit cards currently normalized in the CredoNomics verified comparison database.",
    "href": "/cards/all",
    "category": "Cards",
    "source": "Issuer terms",
    "updated": "",
    "keywords": "cards all All Verified Credit Cards Cards",
    "priority": 60
  },
  {
    "id": "route:/tools/cashback-calculator",
    "title": "Cashback Calculator",
    "description": "Explore Cashback Calculator on CredoNomics Investment Solutions.",
    "href": "/tools/cashback-calculator",
    "category": "Tools",
    "source": "CredoNomics tools",
    "updated": "",
    "keywords": "tools cashback-calculator Cashback Calculator Tools",
    "priority": 60
  },
  {
    "id": "route:/tools/cashback-cap",
    "title": "Cashback Cap Calculator",
    "description": "Calculate how a monthly cashback cap changes the effective cashback rate on eligible spending.",
    "href": "/tools/cashback-cap",
    "category": "Tools",
    "source": "CredoNomics tools",
    "updated": "",
    "keywords": "tools cashback-cap Cashback Cap Calculator Tools",
    "priority": 60
  },
  {
    "id": "route:/cards/compare",
    "title": "Compare Real Credit Cards Side by Side",
    "description": "Select a category and up to three normalized Indian credit cards, then compare them using the same live CredoNomics ranking model.",
    "href": "/cards/compare",
    "category": "Cards",
    "source": "Issuer terms",
    "updated": "",
    "keywords": "cards compare Compare Real Credit Cards Side by Side Cards",
    "priority": 60
  },
  {
    "id": "route:/contact",
    "title": "Contact",
    "description": "Official CredoNomics contact channels.",
    "href": "/contact",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "contact Contact Platform",
    "priority": 60
  },
  {
    "id": "route:/corrections",
    "title": "Corrections & Updates",
    "description": "How to report outdated financial-product terms or calculation issues to CredoNomics.",
    "href": "/corrections",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "corrections Corrections & Updates Platform",
    "priority": 60
  },
  {
    "id": "route:/tools/annual-fee-break-even",
    "title": "Credit Card Annual Fee Break-Even Calculator",
    "description": "Calculate the annual spend needed for a paid credit card to recover its annual fee through incremental rewards.",
    "href": "/tools/annual-fee-break-even",
    "category": "Tools",
    "source": "CredoNomics tools",
    "updated": "",
    "keywords": "tools annual-fee-break-even Credit Card Annual Fee Break-Even Calculator Tools",
    "priority": 60
  },
  {
    "id": "route:/cards/coverage",
    "title": "Credit Card Coverage",
    "description": "See CredoNomics credit-card issuer coverage, normalized real-card records, category coverage and verification-queue status.",
    "href": "/cards/coverage",
    "category": "Cards",
    "source": "Issuer terms",
    "updated": "",
    "keywords": "cards coverage Credit Card Coverage Cards",
    "priority": 60
  },
  {
    "id": "route:/tools/credit-card-finder",
    "title": "Credit Card Finder",
    "description": "Explore Credit Card Finder on CredoNomics Investment Solutions.",
    "href": "/tools/credit-card-finder",
    "category": "Tools",
    "source": "CredoNomics tools",
    "updated": "",
    "keywords": "tools credit-card-finder Credit Card Finder Tools",
    "priority": 60
  },
  {
    "id": "route:/cards/analyzer",
    "title": "Credit Card Intelligence Analyzer",
    "description": "Model Indian credit-card reward economics using your spending pattern, annual fees, reward rates and caps.",
    "href": "/cards/analyzer",
    "category": "Cards",
    "source": "Issuer terms",
    "updated": "",
    "keywords": "cards analyzer Credit Card Intelligence Analyzer Cards",
    "priority": 60
  },
  {
    "id": "route:/disclosures",
    "title": "Disclosures",
    "description": "Regulatory status, calculator limitations and financial-information disclosures for CredoNomics.",
    "href": "/disclosures",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "disclosures Disclosures Platform",
    "priority": 60
  },
  {
    "id": "route:/tools/fuel-card-optimizer",
    "title": "Fuel Card Comparator",
    "description": "Explore Fuel Card Comparator on CredoNomics Investment Solutions.",
    "href": "/tools/fuel-card-optimizer",
    "category": "Tools",
    "source": "CredoNomics tools",
    "updated": "",
    "keywords": "tools fuel-card-optimizer Fuel Card Comparator Tools",
    "priority": 60
  },
  {
    "id": "route:/tools/fuel-surcharge-waiver",
    "title": "Fuel Surcharge Waiver Calculator India",
    "description": "Estimate monthly and annual fuel surcharge waiver value using fuel spend, surcharge rate and waiver cap.",
    "href": "/tools/fuel-surcharge-waiver",
    "category": "Tools",
    "source": "CredoNomics tools",
    "updated": "",
    "keywords": "tools fuel-surcharge-waiver Fuel Surcharge Waiver Calculator India Tools",
    "priority": 60
  },
  {
    "id": "route:/markets",
    "title": "Indian Markets & Stock Search",
    "description": "Search the verified CredoNomics Indian equity security master and open source-aware stock market pages.",
    "href": "/markets",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "markets Indian Markets & Stock Search Platform",
    "priority": 60
  },
  {
    "id": "route:/stocks/search",
    "title": "Indian Stock Search",
    "description": "Search verified Indian listed-company records by company, NSE symbol, BSE code or ISIN when a market-data provider is connected.",
    "href": "/stocks/search",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "stocks search Indian Stock Search Platform",
    "priority": 60
  },
  {
    "id": "route:/methodology",
    "title": "Methodology",
    "description": "How CredoNomics sources, normalizes, calculates and stress-tests financial-product research.",
    "href": "/methodology",
    "category": "Methodology",
    "source": "Methodology",
    "updated": "",
    "keywords": "methodology Methodology Methodology",
    "priority": 60
  },
  {
    "id": "route:/official",
    "title": "Official CredoNomics Website & Channels",
    "description": "Verify the official CredoNomics website, email, Instagram account and contact information.",
    "href": "/official",
    "category": "Company",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "official Official CredoNomics Website & Channels Company",
    "priority": 60
  },
  {
    "id": "route:/privacy",
    "title": "Privacy",
    "description": "CredoNomics privacy information and safe-use guidance.",
    "href": "/privacy",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "privacy Privacy Platform",
    "priority": 60
  },
  {
    "id": "route:/tools/reward-point-value",
    "title": "Reward Point Value Calculator",
    "description": "Convert reward points to an estimated rupee value using your real redemption rate.",
    "href": "/tools/reward-point-value",
    "category": "Tools",
    "source": "CredoNomics tools",
    "updated": "",
    "keywords": "tools reward-point-value Reward Point Value Calculator Tools",
    "priority": 60
  },
  {
    "id": "route:/terms",
    "title": "Terms of Use",
    "description": "Terms of use for CredoNomics financial research and calculators.",
    "href": "/terms",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "terms Terms of Use Platform",
    "priority": 60
  }
]
