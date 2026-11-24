# Research Watch publication record — NPCI UPI Vyapaar Saksham scheme

## Editorial decision

Publish one newly identified, source-verified NPCI member circular: NPCI/UPI/OC No. 242/2026–27, dated 11 November 2026. It creates a fund-backed scheme to encourage UPI acceptance infrastructure and transaction growth among qualifying small merchants. The article is explicitly merchant-focused and explains the limited consumer implications; it does not describe a direct cash grant to merchants or a new customer charge.

The item was absent from the current `app/data/research-watch.ts`, the public Research Watch hub and the November bulletin on 24 November 2026. Existing NPCI OC240 dispute-management and OC241 P2M-routing articles are separate and remain unchanged.

## Dates and audience

- Announcement date: 11 November 2026 (NPCI OC242).
- Editorial check: 24 November 2026.
- Publication date: 24 November 2026.
- Scheme period: three years from the date UPI MDR is implemented.
- Effective/start date: not yet notified in OC242.
- Affected audience: qualifying small merchants, acquiring banks/payment aggregators and UPI users seeking clarity on the merchant-side framework.
- Scheme definition: previous-financial-year annual turnover up to ₹40 lakh, subject to the geography and other conditions in OC242.

## Primary-source reconciliation

1. NPCI/UPI/OC No. 242/2026–27, dated 11 November 2026:
   https://www.npci.org.in/uploads/UPI_OC_242_UPI_Vyapaar_Saksham_Scheme_for_Promoting_UPI_Acceptance_among_Small_Merchants_1842428cd7.pdf

2. Ministry of Finance / Press Information Bureau, 15 September 2026:
   https://www.pib.gov.in/PressReleasePage.aspx?PRID=2310586&lang=1&reg=22

3. NPCI MDR FAQ dated 15 September 2026:
   https://www.npci.org.in/uploads/FA_Qs_Merchant_Discount_Rate_MDR_on_Select_UPI_P2_M_Transactions_58dba1d39e.pdf

4. One97 Communications exchange filing dated 13 October 2026, reproducing NPCI's press-release deferral:
   https://nsearchives.nseindia.com/corporate/PAYTM_13102026143153_SE_DisclosureUpdateNPCIOct2026sd.pdf

5. NPCI official UPI circular register:
   https://www.npci.org.in/circulars/upi

### Reconciliation of the MDR start date

- NPCI's 15 September FAQ originally stated 15 October 2026.
- NPCI's 13 October press release, reproduced in One97 Communications' exchange filing, deferred implementation until immediately after Diwali at a date to be notified separately.
- OC242, dated 11 November, states that its three-year scheme period begins from UPI MDR implementation but does not give the replacement date.
- The NPCI circular register checked on 24 November lists OC242 as the latest UPI circular; no later MDR start-date notification was located.
- Therefore 15 October is treated as superseded, and no post-Diwali date or 1 January 2027 date is inferred.

### Scheme mechanics and exceptions

- The fund receives 5% of the MDR share of participating issuing banks, acquiring banks, payer PSPs and UPI application providers, excluding specified non-eligible categories including industry programmes and capital-market transactions.
- Small merchant for this scheme: annual turnover up to ₹40 lakh in the previous financial year.
- Target geographies: Tier 3–6, North-Eastern States, Jammu & Kashmir and Ladakh; Tier 1–2 only where the merchant is covered by a notified Central Government scheme such as PM SVANidhi or PM Vishwakarma.
- Component A (30%): qualifying new merchants; ₹300 per physical QR code and ₹750 per soundbox claimed by the acquiring bank; at least 25 eligible transactions in any two months of each quarter and at least ₹5,000 transaction value per month; no duplicate funding for the same device.
- Component B (50%): new and existing small merchants; acquiring bank must maintain at least 5% quarter-on-quarter eligible transaction-volume growth; the acquiring bank's incentive is 0.03% of eligible transaction value, with a 50% additional incentive for targeted geographies.
- Component C (20%): the acquiring bank's incentive is 0.20% of incremental eligible transaction value in targeted geographies over the previous quarter, in addition to Component B.
- Eligible transactions are successfully settled UPI payments of ₹2,000 or less at a qualifying small merchant. Reversed, refunded, cancelled or artificial transactions are excluded/recovered; artificial splitting is not rewarded.
- Acquiring banks submit claims; NPCI validates and settles them. Funds are component-specific and claims may be pro-rated if they exceed an allocation. The circular does not promise direct merchant cash or a guaranteed free device.
- The ₹40 lakh annual-turnover definition is distinct from the Ministry's P2PM zero-MDR classification for small merchants receiving up to ₹1 lakh per month through UPI QR. These definitions must not be conflated.
- The Ministry of Finance framework says P2P UPI remains free, P2M payments up to ₹2,000 and qualifying P2PM receipts remain zero-MDR, MDR is not a customer charge, banks should ensure merchants do not pass it on, and UPI apps may not impose platform fees.

## Website implementation

- Add one new `WatchItem` to `app/data/research-watch.ts`.
- Add the explicit `Implementation date unconfirmed` status so the article does not imply a fixed future date.
- Keep announcement date (11 November), checked/publication date (24 November) and scheme start (not yet notified) separate.
- Existing `ResearchWatchBrief` component feeds the Research Watch hub, homepage and November bulletin.
- The new WatchItem follows the repository's unquoted-key data pattern required by `scripts/generate-search-index.mjs`; the production prebuild regenerates the search index and includes the new slug.
- Existing `app/sitemap.ts` imports `researchWatch` and adds each article slug.
- Existing Research navigation already links to Research Watch; no new navigation item is needed.
- No card or fund page is directly affected.
- No ranking formulas, card valuations, payments, authentication, customer/financial records, infrastructure, secrets or paid resources are changed.

## Repository and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `e1501218a44d97a92f61db3032c41a6f29910aa8`
- Rollback branch: `backup/pre-upi-vyapaar-saksham-20261124-1049`
- Feature branch: `editorial/npci-upi-vyapaar-saksham-20261124-1049`
- Editorial check: 24 November 2026.

## Final release verification — 24 November 2026

- Content PR: [#161](https://github.com/aqdas1820/credonomics-site/pull/161), merged.
- Content merge commit: `30cf3da1e269f88db6ff558c8f93c83a23e17482`.
- Production deployment: `dpl_DyhEWzXNhKpwkV7JFzQqfYBZNNDf`.
- Vercel state: `READY`, target `production`; deployed Git commit matches main. Vercel reports production aliases assigned: `www.credonomics.in` and `credonomics.in`.
- Final main SHA at content release: `30cf3da1e269f88db6ff558c8f93c83a23e17482`.
- Vercel prebuild: 177/177 unit tests passed across 29/29 test files; `tsc --noEmit --pretty false` passed; automated IPO dashboard generated 41 records; search index generated 144 entries; Next.js production build completed.
- Build route manifest includes `/research/watch/npci-upi-vyapaar-saksham-small-merchant-scheme-november-2026`, `/research/watch` and `/updates/2026-11`. The sitemap source loops over every `researchWatch` item. The search-index generator reads the data file and includes the new slug using the repository's unquoted-key data pattern.
- Existing non-blocking Autoprefixer, React Hook and `<img>` optimization warnings remained; no build errors were reported.
- Official source links were independently opened: NPCI OC242 PDF, Ministry of Finance PIB release (15 September), NPCI MDR FAQ, One97 Communications' NSE filing reproducing the 13 October NPCI deferral, and NPCI's UPI circular register.

### Public-rendering verification limitation

- Fresh public fetches of the new article, Research Watch hub, November bulletin, homepage, sitemap and search returned `Internal Error` from the external page checker after the production deployment.
- The last accessible unparameterized crawl of the hub, bulletin and homepage still showed the prior 24 November snapshot without the new UPI Vyapaar Saksham item. Cache-busted requests then returned `Internal Error`.
- Vercel confirms the production deployment is READY and the custom-domain aliases are assigned, but the article and public index visibility could not be independently confirmed. This release record therefore does **not** claim that the new content is publicly visible.

### Rechecks and HOLD decisions

- Re-read the five 24 October initial-batch records (IDFC IndiGo, Amex November MITC, HDFC scheme exit window, Tata Neu HDFC manual claims and SBM ZET fees) against current issuer/fund documents. No material correction cleared verification; SBM ZET's effective date remains unverified.
- RBI NEFT procedural PDF/FAQ retrieval remained blocked; no new procedural claim was published.
- SEBI PR 75/2026's official PDF body remained inaccessible.
- Union Mutual Fund merger and Axis Mutual Fund subscription restrictions remain HOLD until complete current AMC addenda and affected-scheme annexures are independently readable.
- ICICI credit-card charge detail PDF remained inaccessible; no extra product claim was inferred.
- AU Zenith+ reward-change claims remain unverified; no blanket reward devaluation was published.
- No refund eligibility/process was inferred. No ranking formula or card/fund valuation was changed.

### Repository and rollback

- Repository: `aqdas1820/credonomics-site`.
- Exact pre-edit main SHA: `e1501218a44d97a92f61db3032c41a6f29910aa8`.
- Original rollback branch: [backup/pre-upi-vyapaar-saksham-20261124-1049](https://github.com/aqdas1820/credonomics-site/tree/backup/pre-upi-vyapaar-saksham-20261124-1049).
- Content feature branch: `editorial/npci-upi-vyapaar-saksham-20261124-1049`.
- Evidence-update base SHA: `30cf3da1e269f88db6ff558c8f93c83a23e17482`.
- Evidence-update rollback branch: [backup/pre-upi-vyapaar-evidence-20261124-1115](https://github.com/aqdas1820/credonomics-site/tree/backup/pre-upi-vyapaar-evidence-20261124-1115).

### Scope safeguards

Only the Research Watch data entry, its explicit unconfirmed-date status, and this publication-evidence document were changed. No card/fund records, ranking formulas, reward valuations, payments, authentication, customer/financial records, infrastructure, secrets or paid resources were changed. No external messages or comments were sent. No automation schedules were changed.

- Research Watch task `6adc4a968f4881919162894e39d400bc` was already disabled; last recorded run: 29 October 2026.
- The separate daily 10 AM research-report task was already disabled in the available automation record (last recorded run: 8 November 2026); it was left unchanged.
- The current publication automation was left unchanged.
