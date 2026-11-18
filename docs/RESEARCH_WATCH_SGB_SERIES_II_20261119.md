# Research Watch publication · 19 November 2026

Exact pre-edit production `main` SHA: `2b0bf328843790e2d0984d1d71bf0b188cd56c7a`.

Rollback reference: `backup/pre-sgb-series-ii-redemption-20261119` (points to that exact SHA).

Feature branch: `editorial/sgb-series-ii-redemption-20261119`.

## New publication-worthy item

### SGB 2020–21 Series II premature-redemption price

- RBI announcement date: 18 November 2026.
- Premature-redemption date: 19 November 2026.
- Independently checked: 19 November 2026.
- Affected audience: holders of SGB 2020–21 Series II, issued on 19 May 2020, who submitted a premature-redemption request for 19 November 2026.
- RBI set the tranche-specific price at **₹13,345 per unit**.
- The price is based on the simple average of IBJA-published 999-purity gold closing prices for 16, 17 and 18 November 2026.
- RBI's 21 August 2026 calendar lists the request window as 19 October–9 November 2026. That window is closed; the 18 November price notice does not reopen it.
- The article asks existing applicants to reconcile the accepted unit count and per-unit amount through their original servicing channel. It does not infer an individual entitlement, credit date, tax result or a new application process.

Primary sources:

- https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=63996
- https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=63416
- https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11864&Mode=0

## Research and deduplication

- Research Watch task `6adc4a968f4881919162894e39d400bc` had no recorded result newer than 29 October 2026 and was disabled. This run combined that recorded result with available later repository publication evidence and fresh official-source checks on 19 November. No automation schedule was changed.
- Inspected the current public homepage, Research Watch hub, November bulletin, existing SGB guides, and current `main` before editing. Existing SGB entries cover different tranches: 2020–21 Series I, 2020–21 Series VIII, 2021–22 Series VII, and 2018–19 Series III. No Series II price guide or duplicate hub/bulletin entry was found.
- Re-read the 24 October initial batch and current primary documents:
  - IDFC FIRST IndiGo: the current issuer page lists 1 BluChip per ₹100 on international spends; no fixed rupee value is inferred.
  - Amex November changes: the current 15 November credit-card MITC contains the eligible refund/reversal adjustment clause. The guide does not infer blanket eligibility, a request process or a timeline.
  - HDFC Balanced Advantage Fund and HDFC Children’s Fund: current Notice 1370 states the optional exit window ended at 3 pm on 6 November and the covered-call change took effect on 9 November; lock-in, pledge and frozen-unit exceptions remain.
  - Tata Neu HDFC manual claims: the issuer PDF remains updated 21 October and states manual claims begin 25 November; 100 NeuCoins minimum, up to three successful requests per day, and separate special/welcome terms remain explicit.
  - SBM ZET: the current official MITC confirms 5% of Total Outstanding Due (₹50 minimum, ₹1,000 maximum), the more-than-three-days-past-due trigger, ₹499 cancellation fee within two years from card issuance, and separately dated 1% rental/education fees effective 15 July. The live article was verified with the PR #120 correction.
- Screened RBI's 16 November notices cancelling 49 NBFC certificates and recording 13 NBFCs plus one HFC surrendering certificates. They were not promoted to a consumer action because the notices do not establish a product-specific effect on existing borrower accounts or change in repayment obligations; no such inference is published.
- The November bulletin already contains the 19 November SEBI Direct Plan statement, Indian Bank ₹3–5 crore bulk schedule, and PR #119/120 corrections. These were not duplicated. Existing product-specific exceptions and HOLDs remain in place.

## Integration

The existing `app/data/research-watch.ts` entry drives the article route, homepage, Research Watch hub and November bulletin. The existing prebuild search-index generator consumes the same data, and `app/sitemap.ts` adds every Research Watch slug. No separate card/fund detail page or navigation change is appropriate for this tranche-specific SGB notice.

No ranking formulas, reward valuations, card/fund records, payment flows, authentication, customer/financial records, infrastructure, secrets, paid resources or automation schedules are changed. The separate daily 10 AM research report is untouched. No external messages or comments are sent.

## Validation and release evidence

- GitHub Actions validation run #44385277231: https://github.com/aqdas1820/credonomics-site/actions/runs/44385277231 — **success**.
- Unit tests: **177 passed across 29 test files**.
- TypeScript: passed.
- Production build: passed; prebuild generated **133 CredoNomics search entries**, and Next.js generated all **334 static pages**. The build route table includes `/research/watch/sgb-2020-21-series-ii-premature-redemption-price-november-2026`.
- Vercel preview deployment `dpl_3hz169kk636Eti6EY5nESm2ubnYV`: **READY**, built from feature head `c317ed5b65733c90e512916bf8220cce202ff82b`; Vercel commit check succeeded.
- PR #121: https://github.com/aqdas1820/credonomics-site/pull/121 — merged. Merge commit / published source commit: `c17f15cba98ac43dad0b6a832b3f4c62bb97da48`.
- Vercel production deployment `dpl_ANorvaSTnnQyN7DyVmb5jiHvaAXe`: **READY**, target `production`, deployed commit `c17f15cba98ac43dad0b6a832b3f4c62bb97da48`; aliases include `www.credonomics.in` and `credonomics.in`.
- **Public visibility is not independently confirmed.** The public-page checker returned an internal error for the new article route, sitemap and search page. The public Research Watch hub, November bulletin and homepage returned snapshots that did not yet show the new Series II item. Therefore the deployment is READY and the route is in the production build, but this release note does **not** claim that the article is confirmed live. The intended route is https://www.credonomics.in/research/watch/sgb-2020-21-series-ii-premature-redemption-price-november-2026.
- The three RBI source URLs above were opened directly and verified. Because the article page could not be fetched publicly, its rendered source-link anchors could not be independently clicked from the live page.
- Follow-up: re-check the public article, hub, November bulletin, homepage, sitemap and search after cache/edge propagation; only then mark public visibility verified.
