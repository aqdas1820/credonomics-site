# CredoNomics Research Watch — 28 November 2026 NFO additions

## Release status

- Content PR: [#215](https://github.com/aqdas1820/credonomics-site/pull/215), merged.
- Content-bearing main commit: `c31a7f63b7cdd3b5ec70823e5b2aee6e2200bfdc`.
- Exact pre-content main SHA: `651046e4cec212d01b934c79c575102edd3cdc1d`.
- Pre-content rollback reference: `backup/pre-bandhan-quant-nfo-20261128-0919` (created from the exact pre-content SHA).
- Evidence-branch base SHA: `c31a7f63b7cdd3b5ec70823e5b2aee6e2200bfdc`.
- Evidence-only rollback reference: `backup/pre-nfo-evidence-20261128-0919`.
- Production deployment: `dpl_EyXVCmBWMg16N5XBvABpWCmakWKp`, state `READY`, target `production`.
- Deployed Git commit matches main: `c31a7f63b7cdd3b5ec70823e5b2aee6e2200bfdc`.
- Vercel reports both `credonomics.in` and `www.credonomics.in` assigned to the production deployment.

## New editorial entries

Checked 28 November 2026. No separate public announcement date was established for either NFO; the offer dates below are not represented as announcement or scheme-effective dates.

### Bandhan Nifty Commodities Index Fund

Intended public route:
https://www.credonomics.in/research/watch/bandhan-nifty-commodities-index-fund-nfo-december-2026

Primary sources:
- AMC NFO page: https://bandhanmutual.com/nfo/bandhan-nifty-commodities-index-fund/
- Official KIM, dated 29 October 2026: https://storage.googleapis.com/nonprod-static-assets-121to59kaawfgfi7bol/2026/11/612644cf-kim-bandhan-nifty-commodities-index-fund.pdf
- AMC-linked SID download: https://storage.googleapis.com/nonprod-static-assets-121to59kaawfgfi7bol/2026/11/b0fe4012-sid-bandhan-nifty-commodities-index-fund.pdf
- AMC TER disclosure: https://bandhanmutual.com/statutory-disclosures/total-expense-ratio

Verified KIM/AMC-page terms:
- NFO: 23 November–3 December 2026; KIM lists 11 December 2026 reopening and also states reopening within five business days from allotment.
- Both NFO-stage scheme and benchmark riskometers are Very High Risk; labels can change after actual investments.
- AMC describes the Nifty Commodities Index as 30 companies across energy, metals, mining, power, construction materials and chemicals.
- KIM allocation: 95–100% in securities belonging to the Nifty Commodities Index (including stock/index derivatives); 0–5% in money-market and other liquid instruments.
- KIM page 9: ₹1,000 NFO lump-sum minimum, ₹100 SIP minimum with at least six instalments, and ₹500 STP minimum.
- KIM page 10: nil exit load; estimated Base Expense Ratio up to 0.90% of daily net assets. Actual TER is not asserted as a fixed current charge; brokerage, transaction costs and statutory levies are separately disclosed.
- KIM page 3 contains derivative permissions. The full SID aggregate-cap wording could not be reconciled in this check; therefore no combined derivative cap is published.
- KIM says the scheme has no performance track record, gives no return guarantee, and states SEBI has not approved/recommended the units or certified the KIM.

### quant Nifty Next 50 Index Fund

Intended public route:
https://www.credonomics.in/research/watch/quant-nifty-next-50-index-fund-nfo-december-2026

Primary sources:
- Current AMC KIM/SID index: https://www.quantmutual.com/downloads/kim
- Official KIM, dated 20 November 2026: https://www.quantmutual.com/Admin/SIDPdf/KIM_quant_Nifty_Next_50_Index_Fund.pdf
- Official SID, dated 20 November 2026: https://quantmutual.com/Admin/SIDPdf/SID_quant_Nifty_Next_50_Index_Fund.pdf
- AMC statutory disclosures: https://www.quantmutual.com/statutory-disclosures

Verified KIM/SID terms:
- NFO: 25 November–7 December 2026.
- Reopening: within five business days from allotment; no fixed calendar reopening date asserted.
- Scheme and benchmark riskometers are Very High Risk at NFO stage and may change after actual investments.
- Tracks the Nifty Next 50 Total Return Index before expenses, subject to tracking error.
- KIM minimum initial purchase ₹5,000; additional purchase ₹1,000. No SIP minimum is asserted because none was stated in the checked KIM.
- KIM lists no entry load and nil exit load as at the document date; it permits prospective changes under the stated regulations.
- Maximum Base Expense Ratio up to 0.90% p.a. is distinguished from actual TER; brokerage, transaction costs and statutory levies may also apply. Actual TER details are stated to be available from the first NAV date.
- Tracking error is targeted within 2% p.a. under normal circumstances but may exceed in abnormal conditions; daily tracking-error and monthly tracking-difference disclosures are specified.
- No performance history at launch; no return guarantee; SEBI has not approved/recommended the units or certified the offer documents.
- The ₹10 NFO unit price is not presented as a valuation signal.

## Site integration and build evidence

The two entries were added to the existing shared `researchWatch` data source. Existing components use that data for the Research Watch hub, homepage, November bulletin and Mutual Funds page. Existing navigation already links those destinations, so no navigation code change was needed.

The Vercel preview build for the final reviewed head was `READY` before merge. The production build for main completed and Vercel reports production `READY`.

Build output:
- 177 unit tests passed across 29 test files.
- `npm run typecheck` / TypeScript passed.
- 41 automated IPO dashboard records generated.
- 163 search-index entries generated by the existing prebuild.
- 369 static pages generated.
- Both new Research Watch article routes appear in the generated route list.
- The existing sitemap route is generated from the shared Research Watch data.

Non-blocking existing warnings observed: Autoprefixer flex alignment compatibility warnings, React Hook dependency warnings, `<img>` optimization warnings, and the existing edge-runtime static-generation warning.

## Public-delivery verification limitation

After the production deployment reported `READY`, direct public fetch attempts were made for:
- Both new article routes.
- `/research/watch`.
- `/updates/2026-11`.
- Homepage.
- `/mutual-funds`.
- Search queries for Bandhan and quant.
- `/sitemap.xml`.

The web retrieval tool returned `Internal Error`, `Cache miss`, or `URL not accessible` for these public pages. Search indexing did not yet return the new routes. Vercel runtime-error inspection showed no runtime errors in the selected 15-minute window, but static-page content was not independently retrieved. Therefore this release note does **not** claim that public page content or search/sitemap visibility was independently confirmed, despite the production deployment being READY and the production aliases being assigned. No DNS, cache, routing, middleware, infrastructure or domain changes were attempted.

## Rechecks and HOLD decisions

The original 24 October batch was re-read; no material correction was justified for:
- IDFC IndiGo international rewards.
- Amex November MITC changes.
- HDFC Notice 1370 optional exit window.
- Tata Neu HDFC manual claims.
- SBM ZET fees; the effective date remains unresolved.

Other incomplete or contradictory candidates remain on HOLD:
- SBI Card fee rows: current issuer webpage and downloadable MITC do not reconcile.
- Federal Bank minimum-amount-due formula: current MITC and KFS conflict.
- Invesco Financial Services Debt Fund: AMC page status conflicts with other date claims.
- HDFC Charity Fund: AMC/SID date and duration details conflict.
- SEBI mutual-fund draft filings: draft stage only, not final scheme documents.
- SBM ZET late-fee effective date: not established.
- Bandhan aggregate derivative cap: not published because KIM/SID wording was not fully reconciled.

No card/fund ranking formula, reward valuation, payment flow, authentication flow, customer/financial record, infrastructure, secret or paid resource was changed.

## Automation and communications

No automation schedule was changed. The saved Research Watch task `6adc4a968f4881919162894e39d400bc` remains disabled with its last recorded run on 29 October 2026. The saved daily 10 AM research report is also already disabled (last recorded run 8 November 2026); it was not enabled, disabled or rescheduled in this release. No external messages or comments were sent.
