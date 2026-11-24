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
- Component B (50%): new and existing small merchants; acquiring bank must maintain at least 5% quarter-on-quarter eligible transaction-volume growth; 0.03% of eligible transaction value, with a 50% additional incentive for targeted geographies.
- Component C (20%): 0.20% of incremental eligible transaction value in targeted geographies over the previous quarter, in addition to Component B.
- Eligible transactions are successfully settled UPI payments of ₹2,000 or less at a qualifying small merchant. Reversed, refunded, cancelled or artificial transactions are excluded/recovered; artificial splitting is not rewarded.
- Acquiring banks submit claims; NPCI validates and settles them. Funds are component-specific and claims may be pro-rated if they exceed an allocation. The circular does not promise direct merchant cash or a guaranteed free device.
- The ₹40 lakh annual-turnover definition is distinct from the Ministry's P2PM zero-MDR classification for small merchants receiving up to ₹1 lakh per month through UPI QR. These definitions must not be conflated.
- The Ministry of Finance framework says P2P UPI remains free, P2M payments up to ₹2,000 and qualifying P2PM receipts remain zero-MDR, MDR is not a customer charge, banks should ensure merchants do not pass it on, and UPI apps may not impose platform fees.

## Website implementation

- Add one new `WatchItem` to `app/data/research-watch.ts`.
- Add the explicit `Implementation date unconfirmed` status so the article does not imply a fixed future date.
- Keep announcement date (11 November), checked/publication date (24 November) and scheme start (not yet notified) separate.
- Existing `ResearchWatchBrief` component feeds the Research Watch hub, homepage and November bulletin.
- Existing `scripts/generate-search-index.mjs` reads `app/data/research-watch.ts`; the production prebuild regenerates the search index.
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

## Final release evidence

Pending PR checks, merge, production deployment and public-route/source-link verification. This section will be completed only after those steps are confirmed.
