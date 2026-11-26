# Research Watch release evidence — Amex credit-balance refund clarification

## Editorial decision

Corrected the existing American Express India guide after re-reading the current credit-card Most Important Terms and Conditions (MITC), updated **15 November 2026**. Verification date: **26 November 2026**. Original article publication date remains **24 October 2026**.

The correction separates two provisions on MITC page 15:

1. Where an overpayment or merchant credit leaves a credit balance, the MITC tells the cardmember to promptly request a refund using the phone number on the back of the card or the Mobile App Chat option, with NEFT details ready.
2. Separately, eligible refunds and reversals received by the card payment due date, where payment has not been made by then, are adjusted towards the Minimum and Total Amount Due, including credits received after statement generation.

The MITC does **not** define which credits qualify for the due-date adjustment. The article does not infer that every merchant credit is refundable, does not promise a processing timeline or an account-specific outcome, and does not treat the two clauses as one process. The due-date adjustment clause has no separate effective date stated in the MITC.

## Article record and intended public routes

- Canonical article: https://www.credonomics.in/research/watch/amex-november-2026-fees-and-service-dates
- Research Watch hub: https://www.credonomics.in/research/watch
- November bulletin: https://www.credonomics.in/updates/2026-11
- Homepage: https://www.credonomics.in/
- Relevant Amex card records: SmartEarn, Membership Rewards, Platinum Travel and Platinum Reserve (the article retains its existing cardIds).

The correction is data-driven through `app/data/research-watch.ts`. Existing shared Research Watch components feed the homepage, hub, month-specific bulletin and relevant card pages. The build-time search-index generator reads the same data; the existing sitemap generator includes Research Watch slugs. No new navigation item was required. No card ranking, reward valuation or investment ranking formula was changed.

## Rechecked original 24 October batch

The current data records and issuer/fund documents were re-read. No new unsupported claims were introduced:

- IDFC IndiGo: 1 BluChip per ₹100 international spend, 0% forex and the billing-cycle credit-limit earning cap retained.
- Amex November: the 15 November credit-card MITC remains current; refund/reversal eligibility remains conditional and distinct from the credit-balance refund instruction.
- HDFC Mutual Fund: the two-scheme exit window closed 6 November at 3 PM; changes effective 9 November; pledge, frozen-unit and Children’s Fund lock-in exceptions retained.
- Tata Neu HDFC: manual claiming effective 25 November; 100 NeuCoins minimum, up to three successful daily claims; older-statement and promotional-reward exceptions retained.
- SBM ZET: current consolidated MITC lists 5%, ₹50 minimum and ₹1,000 maximum; effective date and individual-account applicability remain HOLD because the earlier ₹299 retrieval is not reconciled by an issuer version/effective-date notice.

## Other findings held from publication

- Bandhan mutual-fund scheme merger: official exchange notices describe the exit window through 30 November 2026, but systematic-facility migration wording differs between exchange notices and the original AMC notice/annexure could not be read in this review. The disputed migration instructions and any broader platform applicability remain HOLD.
- SEBI half-yearly significant-indices review: official landing page identified, but the linked PDF body could not be independently read; no retail action inferred.
- No new card-ranking formula, blanket devaluation or unverified refund entitlement was published.

## Primary source

1. American Express India credit-card MITC, updated 15 November 2026: https://www.americanexpress.com/content/dam/amex/in/legal/mitc/Lending_MITC_English.pdf — page 15, lines covering credit-balance refund requests and eligible refund/reversal adjustment.
2. American Express India Consumer Experience Updates: https://www.americanexpress.com/en-in/support/digital/consumer-experience-updates/
3. RBI Master Direction — Credit Card and Debit Card — Issuance and Conduct Directions, 2022: https://rbi.org.in/SCRIPTS/BS_ViewMasDirections.aspx?id=13155

## Git and rollback evidence

- Pre-edit main SHA: `46b94236a222379393b9c8683c8168c90e8a5478`
- Rollback branch created at that exact SHA: `backup/pre-amex-refund-clarification-20261126-1226`
- Content feature branch: `research-watch/amex-credit-balance-refund-clarification-20261126-1226`
- Content PR: https://github.com/aqdas1820/credonomics-site/pull/186
- Content commits: `7d6ef6b1b4d3d4d59b47466480fc4f8964abc339`, `c051a6a759f200fa3400a6f264cf79e0f7bf3eda`
- Merge commit / main at content release: `0327e0ed2e4368e77e17a336100b8f80d9118d40`
- Evidence-only PR: this document is added separately so the release record can include final deployment and public-verification status.

## Build and deployment evidence

- Preview deployment: `dpl_BWgpwbMpqrTpdPV2DQ4SmKtag7P1`, READY, feature-branch head `c051a6a759f200fa3400a6f264cf79e0f7bf3eda`.
- Production deployment: `dpl_9rX8nuQ6J9s5E7fu6Wp4RLaNUKVz`, READY, deployed commit `0327e0ed2e4368e77e17a336100b8f80d9118d40`.
- Vercel aliases listed for that deployment: `credonomics.in`, `www.credonomics.in`, and the Git-main alias.
- Unit tests: 29/29 files and 177/177 tests passed.
- TypeScript: `tsc --noEmit --pretty false` completed without reported errors.
- IPO dashboard generator: 41 records.
- Search-index generator: 150 entries.
- Next.js 15.5.28 production build: compiled successfully; Vercel reported Build Completed in /vercel/output [1m]. The Research Watch route and hub were present in the generated route table.
- Existing Autoprefixer, React Hook and image-optimization warnings were non-blocking.

## Public-render verification limitation

The production deployment is READY and Vercel lists the custom-domain aliases, but public content verification did **not** confirm the correction:

- The direct public Amex article fetch still returned the older snapshot: Checked 25 November 2026, with the old statement that the MITC did not describe a separate request process. The new 26 November update, credit-balance refund instruction and revised limitations were absent from the fetched page.
- The Research Watch hub and November bulletin show a 26 November latest check and the SEBI KRA article; the Amex article correction was not independently visible through the direct article route.
- The homepage shows the 26 November Research Watch check and KRA item.
- `/sitemap.xml` still returned Internal Error through the public checker.
- Direct Vercel deployment hostnames were not accessible through the public checker. The official Amex MITC PDF itself is accessible and confirms both clauses on page 15.

Therefore this change is **merged and deployed READY, but the corrected Amex article is not publicly live-confirmed**. No cache purge, DNS, routing, project configuration or infrastructure change was attempted. Recheck the canonical article and public sitemap/search surfaces before describing the correction as live.

## Scope and safeguards

Only the Research Watch data record and this release-evidence document are in scope. Payments, authentication, customer/financial records, infrastructure, secrets, paid resources and ranking formulas were not changed. No external messages or comments were sent.

Research Watch source task `6adc4a968f4881919162894e39d400bc` remains disabled with its last recorded result dated 29 October 2026. The saved daily 10 AM research-report record is also disabled (last recorded run 8 November 2026). Neither task status nor any automation schedule was changed in this run.


## Follow-up source clarification — Amex consumer credit-balance FAQ

Checked **26 November 2026**. This is a source-backed addition to the existing Amex article, not a new article or a general refund-eligibility claim.

The official Amex India consumer FAQ states that where an unclaimed credit balance is **greater than ₹50,000**, the cardmember **may be asked** to provide additional information, including:
- a bank statement reflecting the last payment made towards the Card;
- payee name;
- bank account number; and
- IFSC code.

The FAQ says Customer Service will provide the necessary details when the request is submitted. It does not say that this list is mandatory for every request. It also provides separate instructions for cancelled Cards. No processing time, universal refund entitlement, or eligibility for every merchant credit is inferred.

- Exact official FAQ: https://www.americanexpress.com/in/customer-service/faq.payments-statements-and-balance.claim-a-refund-of-the-credit-balance.html
- Existing 15 November 2026 credit-card MITC, page 15: https://www.americanexpress.com/content/dam/amex/in/legal/mitc/Lending_MITC_English.pdf
- The MITC's credit-balance instruction remains distinct from its separate eligible-refund/reversal adjustment towards the Minimum and Total Amount Due.

### Follow-up Git and rollback evidence

- Pre-edit main SHA: `6a6836fd286a2944525961e730f09b33e687d6f7`
- Rollback branch created at that exact SHA: `backup/pre-amex-faq-clarification-20261126-1253`
- Content feature branch: `research-watch/amex-credit-balance-faq-clarification-20261126-1253`
- Content commit: `a09197221eaf103d9bd9f5b99f4a244832e47916`

### Verification and publication status

The public homepage, Research Watch hub and November bulletin show the 26 November KRA publication. The Amex article route still serves an older checked-date snapshot (25 November on the apex URL; 19 November on a trailing-slash/www fetch) and does not yet expose the 26 November MITC correction or this FAQ detail. Vercel confirms both custom-domain aliases point to the production deployment built from main SHA `6a6836fd286a2944525961e730f09b33e687d6f7`. This is a public-render discrepancy; no DNS, cache-purge, routing or infrastructure change was made. Do not describe the Amex FAQ addition as publicly live until the canonical article route exposes it.

No card ranking formula, reward valuation, payment, authentication, customer/financial record, infrastructure, secret, paid resource or automation schedule was changed.
