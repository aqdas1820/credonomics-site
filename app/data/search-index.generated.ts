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
    "title": "Explore CredoNomics — Platform Directory",
    "description": "Find every CredoNomics workspace: markets, research, IPOs, mutual funds, credit cards, calculators, watchlists and platform information.",
    "href": "/discover",
    "category": "Discovery",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "discover Explore CredoNomics — Platform Directory Discovery",
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
    "id": "watch:amex-november-2026-fees-and-service-dates",
    "title": "Amex November changes: milestones, reward balances, fees and dates",
    "description": "From 15 November, posting dates determine milestones and Membership Rewards balances stay separate by card. Check fee and application dates too.",
    "href": "/research/watch/amex-november-2026-fees-and-service-dates",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-25",
    "keywords": "Amex November changes: milestones, reward balances, fees and dates amex-november-2026-fees-and-service-dates Research",
    "priority": 92
  },
  {
    "id": "watch:axis-myzone-district-movie-spend-november-2026",
    "title": "Axis MyZone movies: check ₹25,000 eligible spend before using District",
    "description": "From 1 November, the MyZone District buy-one-get-one offer needs eligible settled spend in the preceding three calendar months, subject to a new-card exemption.",
    "href": "/research/watch/axis-myzone-district-movie-spend-november-2026",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-26",
    "keywords": "Axis MyZone movies: check ₹25,000 eligible spend before using District axis-myzone-district-movie-spend-november-2026 Research",
    "priority": 92
  },
  {
    "id": "watch:idfc-international-rewards-revised-september-notice",
    "title": "IDFC FIRST international rewards: read the revised September notice",
    "description": "A later bank communication says applicable international reward points continue alongside zero forex markup; the earlier blanket stop notice is incomplete on its own.",
    "href": "/research/watch/idfc-international-rewards-revised-september-notice",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-25",
    "keywords": "IDFC FIRST international rewards: read the revised September notice idfc-international-rewards-revised-september-notice Research",
    "priority": 92
  },
  {
    "id": "watch:idfc-indigo-international-rewards-october-2026",
    "title": "IndiGo IDFC FIRST: international reward rule changes on 26 October",
    "description": "The issuer specifies 1 BluChip per ₹100 on international purchases from 26 October 2026.",
    "href": "/research/watch/idfc-indigo-international-rewards-october-2026",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-24",
    "keywords": "IndiGo IDFC FIRST: international reward rule changes on 26 October idfc-indigo-international-rewards-october-2026 Research",
    "priority": 92
  },
  {
    "id": "watch:pnb-credit-card-redemption-utility-fees-november-2026",
    "title": "PNB November fees: reward redemption and high utility payments",
    "description": "From 1 November 2026, the notice adds ₹99 per reward-redemption request and a threshold-based utility fee, before GST.",
    "href": "/research/watch/pnb-credit-card-redemption-utility-fees-november-2026",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-26",
    "keywords": "PNB November fees: reward redemption and high utility payments pnb-credit-card-redemption-utility-fees-november-2026 Research",
    "priority": 92
  },
  {
    "id": "watch:sbm-zet-late-fee-october-2026",
    "title": "SBM ZET: late-payment fee becomes balance-linked",
    "description": "From 23 October 2026, the published fee is 5% of outstanding, with a ₹50 minimum and ₹1,000 maximum, before applicable GST.",
    "href": "/research/watch/sbm-zet-late-fee-october-2026",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-24",
    "keywords": "SBM ZET: late-payment fee becomes balance-linked sbm-zet-late-fee-october-2026 Research",
    "priority": 92
  },
  {
    "id": "watch:sebi-early-pay-in-margin-waiver-february-2027",
    "title": "SEBI early pay-in: additional cash-market margin relief from February 2027",
    "description": "Accepted securities early pay-in can support eligible subsequent cash-segment positions; broker margin checks still apply.",
    "href": "/research/watch/sebi-early-pay-in-margin-waiver-february-2027",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-25",
    "keywords": "SEBI early pay-in: additional cash-market margin relief from February 2027 sebi-early-pay-in-margin-waiver-february-2027 Research",
    "priority": 92
  },
  {
    "id": "watch:sebi-whatsapp-stock-tips-verification-checklist",
    "title": "SEBI WhatsApp stock-tip warning: verify the intermediary and trading app",
    "description": "A 22 October advisory flags unknown invitation-only tip groups, planted profit claims and replacement-group invitations. Use official verification links before trusting a recommendation.",
    "href": "/research/watch/sebi-whatsapp-stock-tips-verification-checklist",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-25",
    "keywords": "SEBI WhatsApp stock-tip warning: verify the intermediary and trading app sebi-whatsapp-stock-tips-verification-checklist Research",
    "priority": 92
  },
  {
    "id": "watch:swiggy-hdfc-migration-autopay-checklist",
    "title": "Swiggy HDFC migration: re-register autopay and check your replacement",
    "description": "The legacy card is being phased out. Your migration notice sets the timeline; mandates and card controls need setting up again.",
    "href": "/research/watch/swiggy-hdfc-migration-autopay-checklist",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-25",
    "keywords": "Swiggy HDFC migration: re-register autopay and check your replacement swiggy-hdfc-migration-autopay-checklist Research",
    "priority": 92
  },
  {
    "id": "watch:tata-neu-hdfc-manual-neucoins-claims-november-2026",
    "title": "Tata Neu HDFC: claim NeuCoins manually from 25 November",
    "description": "A new claim step replaces automatic transfer for statements from 25 November 2026; unclaimed rewards can expire.",
    "href": "/research/watch/tata-neu-hdfc-manual-neucoins-claims-november-2026",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-24",
    "keywords": "Tata Neu HDFC: claim NeuCoins manually from 25 November tata-neu-hdfc-manual-neucoins-claims-november-2026 Research",
    "priority": 92
  },
  {
    "id": "watch:hdfc-fund-covered-call-exit-window-november-2026",
    "title": "Two HDFC schemes: optional exit window closes at 3 pm on 6 November",
    "description": "Balanced Advantage and Children’s Fund add a covered-call strategy from 9 November; eligible holders have a limited optional exit window.",
    "href": "/research/watch/hdfc-fund-covered-call-exit-window-november-2026",
    "category": "Research",
    "source": "Official issuer / fund notice",
    "updated": "2026-10-24",
    "keywords": "Two HDFC schemes: optional exit window closes at 3 pm on 6 November hdfc-fund-covered-call-exit-window-november-2026 Research",
    "priority": 92
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
    "description": "Choose a research workspace, compare source-linked cards or model a financial rule with a focused CredoNomics calculator.",
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
    "id": "route:/updates/2026-10",
    "title": "October 2026 Research Updates: Card Changes & Portfolio Disclosures",
    "description": "Official issuer changes, corrected credit-card rankings and September portfolio disclosures reviewed by CredoNomics in October 2026, with effective dates and sources.",
    "href": "/updates/2026-10",
    "category": "Research",
    "source": "Research Desk",
    "updated": "",
    "keywords": "updates 2026-10 October 2026 Research Updates: Card Changes & Portfolio Disclosures Research",
    "priority": 86
  },
  {
    "id": "route:/research/watch",
    "title": "Research Watch: Verified Changes & Action Dates",
    "description": "Selected source-checked card, market and mutual-fund notices from CredoNomics Research Watch, with the latest publication on 26 October 2026, with scope and action dates.",
    "href": "/research/watch",
    "category": "Research",
    "source": "Research Desk",
    "updated": "",
    "keywords": "research watch Research Watch: Verified Changes & Action Dates Research",
    "priority": 86
  },
  {
    "id": "route:/ipo/current",
    "title": "Current IPOs",
    "description": "Browse open and closing-today IPOs with date-validated CredoNomics market intelligence.",
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
    "description": "Browse future-dated IPOs with date-validated CredoNomics market intelligence.",
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
    "id": "route:/account",
    "title": "Account",
    "description": "Explore Account on CredoNomics Investment Solutions.",
    "href": "/account",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "account Account Platform",
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
    "id": "route:/cards/wallet",
    "title": "My Card Wallet — Compare the Cards You Hold",
    "description": "Save your card names on this device and compare their estimated category value using source-linked issuer terms. No card numbers or signup needed.",
    "href": "/cards/wallet",
    "category": "Cards",
    "source": "Issuer terms",
    "updated": "",
    "keywords": "cards wallet My Card Wallet — Compare the Cards You Hold Cards",
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
    "id": "route:/alerts",
    "title": "Price Alerts",
    "description": "Manage personal equity price and market-move alerts.",
    "href": "/alerts",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "alerts Price Alerts Platform",
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
  },
  {
    "id": "route:/watchlist",
    "title": "Watchlist",
    "description": "Track Indian equities with verified market quotes and personal alerts.",
    "href": "/watchlist",
    "category": "Platform",
    "source": "CredoNomics",
    "updated": "",
    "keywords": "watchlist Watchlist Platform",
    "priority": 60
  }
]
