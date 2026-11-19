# CredoNomics Research Watch editorial review — 20 November 2026

## Status

This is a staged editorial review, not a production release. The feature branch is based on the exact current `main` SHA below. No production merge or deployment has been made.

- Repository: `aqdas1820/credonomics-site`
- Base `main` SHA: `bd150f3c5c39827a45eaaf6a24e0e4acd95fe615`
- Rollback reference: `backup/pre-research-watch-20261120-0123`
- Feature branch: `editorial/research-watch-20261120-0123`

## Staged content changes

### Axis Bank Select — District movie-offer spend condition

- Checked: 20 November 2026
- Effective: 1 November 2026
- Announcement date: not separately stated on the official page
- Affected audience: existing Axis Select cardholders using the District movie offer
- Official source: https://cug.axisbank.com/cards/credit-card/axis-bank-select-credit-card
- Verified condition: ₹25,000 minimum eligible spend in the preceding three calendar months; the Select offer remains up to ₹250 off twice monthly using AXISSELECT.
- Product-specific reconciliation: the separate Axis Privilege and Privilege Easy pages also display a ₹25,000 / preceding-three-calendar-month condition, but list a once-monthly offer and do not state the same 1 November effective date. They are linked separately; the dated Select change is not generalized.
- Other product pages: https://cug.axisbank.com/cards/credit-card/privilege-credit-card-with-unlimited-benefits and https://cug.axisbank.com/cards/credit-card/privilege-easy-credit-card
- Limitations: Axis does not define eligible-spend categories or a new-card transition exception on the pages checked. No before/after threshold is asserted.

### Roarbank — tariff page reconciled with dated KFS and MITC

- Original publication date preserved: 16 November 2026
- Rechecked: 20 November 2026
- Effective: 21 November 2026
- Announcement date: not separately stated
- Affected audience: Roarbank cardholders considering early closure of Standard EMI or Partner EMI
- KFS: https://roar.unity.bank.in/doc/Key%20Fact%20Sheet%20Roarbank.pdf
- MITC: https://roar.unity.bank.in/doc/MITC%20Credit%20card.pdf
- Current tariff page: https://roar.unity.bank.in/en/tariffs
- Reconciliation: the September KFS and MITC show 2% before the change and 3% from 21 November for both EMI types, calculated on remaining principal plus applicable GST. The current tariff page now displays 3% but gives no effective date. Partial prepayments are not permitted.
- Limitation: issuer documents do not resolve requests submitted before 21 November but processed on or after that date. No request-date or processing-date assumption is made.

### AU Zenith+ — correction to an unsupported reward-removal claim

- Original publication date preserved: 15 November 2026
- Rechecked: 20 November 2026
- Effective: 1 December 2026
- Announcement date: not separately stated
- Affected audience: AU Zenith+ cardholders planning international transactions or approaching the yearly milestone
- MITC v2.23, dated 2 November: https://www.au.bank.in/as/as/SOC_CC-MITC%28with-Schedule-of-Charges%29.pdf
- Official product page: https://www.au.bank.in/premium-banking/credit-cards/zenith-plus-credit-card
- Reconciliation: the MITC lists 0% issuer currency markup for Zenith+ from 1 December; the current product page continues to advertise up to 2 Reward Points per ₹100 on dining, travel and international spends. The earlier claim that international rewards stop on 1 December is withdrawn because no dated primary-source removal was found.
- Taj milestone: the product page says customers becoming eligible for the yearly milestone from 1 December with ₹12 lakh in card-anniversary-year spend become eligible for Taj Preferred, including a complimentary night at selected hotels.
- Limitations: merchant currency conversion may still affect the total; existing Taj memberships and pre-cutoff milestone transitions remain unverified. No reward valuation or ranking formula is changed.

### RBI Domestic Money Transfer Directions — no new limits

- Original publication date preserved: 11 November 2026
- Rechecked: 20 November 2026
- Announcement and effective date: 11 November 2026; effective immediately
- Affected audience: people using DMT cash pay-in or cash pay-out services, including bank branches, Business Correspondents and ATMs
- Current official Directions: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13752&Mode=0
- Earlier official circulars checked: https://rbi.org.in/scripts/FS_Notification.aspx?Id=6750&Mode=0&fn=9 and https://rbi.org.in/scripts/FS_Notification.aspx?Id=12707&Mode=0&fn=9
- Correction: the 2011 circular already set the ₹10,000 per transaction / ₹25,000 monthly cash pay-out cap and the ₹5,000 per transaction / ₹25,000 monthly BC/ATM cash pay-in cap. The 2024 review expressly retained all other 2011 instructions, including transaction limits. The 11 November 2026 Directions repeat those limits and repeal the two earlier circulars. This is a consolidation, not a limit hike.
- Branch walk-in NEFT remains up to ₹50,000. Cash pay-in through BCs/ATMs remains ₹5,000 per transaction and ₹25,000 per month per remitter. Card-to-card transfers remain outside this DMT framework.
- Providers may set reasonable charges; no universal fee or free-service claim is made.
- Consumer-facing note: distinguish cash pay-in from cash pay-out; do not apply these DMT limits to UPI or card-to-card transfers.

## Existing coverage rechecked

The 24 October initial batch was re-read in the current repository data and public guides: IDFC IndiGo international rewards; Amex November changes; HDFC Balanced Advantage and Children’s Fund exit windows; Tata Neu HDFC manual NeuCoins claims; and SBM ZET fees. Existing product-specific exclusions and unresolved transition language remain in place. No duplicate article was added for those findings.

The 29 October Research Watch automation result remains the latest recorded task result. The Research Watch task is disabled. Its 29 October SEBI Direct Plan default finding remains HOLD: the official SEBI speech page is available, but the linked original PDF timed out during this review and no implementing circular was independently verified. No claim is promoted from HOLD.

## Integration

The existing `researchWatch` data source drives the article route, Research Watch hub, homepage brief, month-filtered bulletin, search-index generator and sitemap. The new Axis item is included in that data source. No verified Axis Select card-detail record exists in `verified-real-cards.ts`, so no incomplete card page or ranking entry is created.

## Validation and release gate

- Current production before this review: Vercel READY on `bd150f3c5c39827a45eaaf6a24e0e4acd95fe615`.
- Vercel preview build for the feature commit `8fb9e540fdd6bff2055d85aac04e723f5a87393e`: READY. The Next.js production build completed, generated 338 static pages and 135 search entries, and ran its built-in lint/type-validity check.
- Unit tests: not run. The existing GitHub Actions workflows are path-scoped; none covers `app/data/research-watch.ts` or this editorial review.
- Standalone TypeScript command: not run. Local repository clone is blocked by DNS resolution failure for `github.com`; creating a new paid sandbox or changing project build settings was avoided.
- Production build: completed on the Vercel preview. The Next.js build log includes `Linting and checking validity of types`; the build completed successfully. Standalone `npm run typecheck` was not run. The preview URL could not be fetched by the public-page checker, so preview article/hub/bulletin/sitemap visibility is not independently confirmed. A successful build is not a substitute for the missing unit-test result.
- Draft PR #131 is intentionally not merged. Do not merge or deploy until unit tests can be completed without changing infrastructure or paid resources; TypeScript validity was checked as part of the successful Next.js build.

## Safeguards

No payment flows, authentication, customer or financial records, infrastructure, secrets, paid resources, ranking formulas or automation schedules were changed. No external messages or comments were sent. The daily 10 AM research report was not modified; its separate automation was already disabled when checked.
