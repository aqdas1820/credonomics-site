CREDONOMICS V14 — IPO INTELLIGENCE
===================================

PURPOSE
Build a source-linked Indian IPO data investigation platform without publishing
Subscribe/Avoid/Buy calls, price targets, listing-gain forecasts or a GMP-driven
fundamental ranking.

PUBLIC ROUTES
/ipo
/ipo/analyzer
/ipo/methodology
/ipo/<verified-ipo-slug>

DATA LAYERS
1. DISCOVERY
   Official SEBI Public Issues filings.
   DRHP/RHP/prospectus/addendum/corrigendum records.
   Discovery records are NOT automatically scored.

2. NORMALIZED VERIFIED IPO RECORDS
   public/data/ipo/verified/*.json
   Must contain source links and lastVerified date.
   scripts/ipo/validate-ipo-data.mjs validates these records.
   scripts/ipo/build-verified-ipos.mjs converts them to the TS module used by the site.

3. QUANTITATIVE DATA SCORE
   Fixed 100-point statistical model:
   Revenue CAGR                  12
   PAT CAGR                      12
   ROE                           10
   ROCE                          10
   CFO/PAT                       12
   Debt/Equity                   10
   P/E vs peer median            14
   P/B vs peer median             6
   Fresh-issue share              7
   OFS share                      4
   Top-customer concentration     3

   Score is withheld below 50% weighted data coverage.

OUTSIDE THE FUNDAMENTAL SCORE
- Grey Market Premium (GMP)
- Subscription multiple
- Listing-gain prediction
- Buy/Sell/Subscribe/Avoid language
- Price targets

OFFICIAL RESEARCH SOURCES
SEBI Public Issues:
https://www.sebi.gov.in/filings/public-issues.html

NSE upcoming/public issues:
https://www.nseindia.com/market-data/all-upcoming-issues-ipo

NSE IPO tracker:
https://www.nseindia.com/ipo-tracker?type=ipo_year

REGULATORY POSITIONING
CredoNomics remains clearly disclosed as not SEBI-registered and not NISM-certified.
The IPO product is designed around statistical summaries, objective normalized data
and transparent calculations. Obtain professional securities-law/compliance review
before expanding the feature into opinions or recommendations concerning public offers.

MF SAFETY
No mutual-fund tracker/data/scripts are modified.
app/globals.css is not modified.
