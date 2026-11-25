# ICICI Bank domestic account charges — editorial publication record

## Status

Prepared on the feature branch for the 1 December 2026 tariff revisions. This is a new consumer guide based on current issuer schedules, with product-specific exceptions retained.

- Repository: `aqdas1820/credonomics-site`
- Base `main` SHA: `a0638e8be362c0c92e75f982fc809c48806b470c`
- Rollback reference: `backup/pre-icici-savings-charges-20261123-1920`
- Feature branch: `editorial/icici-savings-charges-20261123-1920`
- Editorial check: 23 November 2026
- Announcement date: not separately stated in the checked issuer documents
- Effective date: 1 December 2026

## Verified changes

### Branch cash charges

For the verified current/legacy Regular Savings and Senior Citizen/Pensioner, Student Savings, Minor Family Banking, Regular/Select/Wealth-Private/Power Pay/Defence/Unfunded/Blind Salary schedules:

- Three complimentary deposit transactions and three complimentary withdrawal transactions per month remain.
- The standard monthly value limit remains ₹1 lakh each for deposits and withdrawals.
- After the value limit, the rate rises from ₹3.50 to ₹4 per ₹1,000 or ₹150, whichever is higher.
- The separate count-based fee remains ₹150 per transaction after the three free transactions.
- If count and value limits are crossed on the same transaction, the higher applicable charge applies.
- Wealth/Private programme schedules have conditional 15-transaction / ₹15-lakh limits; eligibility routes vary by product.

### ECS/NACH returns

For financial reasons: first return ₹500; second and third ₹550; maximum three recoveries per month for the same mandate. This appears in the checked regular, senior, BSBDA/PMJDY, Special Needs Savings, student, minor and listed salary schedules.

### Product-specific demand drafts

Only the checked Select Banking Salary, Power Pay and Defence Salary schedules add a 1 December DD rule: up to ₹1 lakh nil; above ₹1 lakh ₹2 per ₹1,000, capped at ₹15,000.

## Product-specific reconciliation

- BSBDA/PMJDY: cash transaction charges remain nil; ECS/NACH return fee changes.
- Special Needs Savings Account for visually impaired/incapacitated customers: cash transaction charges remain nil; ECS/NACH return fee changes.
- Salary Account for Visually Impaired is a distinct salary product and does include the cash-charge revision.
- Student Savings and Minor Family Banking schedules include the dated cash and ECS/NACH revisions.
- Current and legacy Regular Savings and Senior Citizen/Pensioner schedules were checked separately.
- Regular, Select, Wealth/Private, Power Pay, Defence, Unfunded and Blind Salary schedules were checked separately.
- The separate Family Account for Salaried Professionals schedule checked did not show a 1 December annexure and is not treated as changed.
- The separate NRI Savings notice was not fully reconciled and remains outside scope.

## Exact primary sources

- https://www.icici.bank.in/about-us/notice-board
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/savings-account.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/regular-savings-account-socs.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/senior-savings-account.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/senior-citizen-regular-savings-account-socs.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/basic-savings-bank-deposit-account-socs.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/blind-visually-impaired-incapacitated-savings-account-socs.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/campus-power-account.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/regular-salary-account-service-charges3.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/soc-select-banking-salary-account.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/wealth-management-private-banking.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/power-pay-account-service-charges-6.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/defence-salary-account-service-charges.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/soc-for-unfunded-salary-account.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/blind-salary-account.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/kide-family-banking-service-charges.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/family-account-of-salary-account-holders.pdf

## Implementation pattern

The entry is in `app/data/research-watch.ts`. Existing `ResearchWatchBrief` data flow supplies the Research Watch hub, homepage and November bulletin. The existing search-index generator enriches Research Watch entries, and `app/sitemap.ts` adds every Research Watch article route. No separate navigation item, card-ranking change, card/fund data edit or payment/authentication change is required.

## Validation and release evidence

### GitHub review and rollback

- Content PR: [#152](https://github.com/aqdas1820/credonomics-site/pull/152) — merged.
- Reviewed feature-branch head: `3209a2f07ede52d38e4a4edbe40a1673a7d2660f`.
- Merge commit and production source commit: `f574ef9ba3459fc6741275693d0e9ade49c4a1d3`.
- Exact pre-edit `main` SHA: `a0638e8be362c0c92e75f982fc809c48806b470c`.
- Pre-edit rollback reference: `backup/pre-icici-savings-charges-20261123-1920`.
- Evidence-update base `main` SHA: `f574ef9ba3459fc6741275693d0e9ade49c4a1d3`.
- Evidence-update rollback reference: `backup/pre-icici-release-evidence-20261123-1950`.

### Build and deployment

- Vercel preview deployment: `dpl_6sBzVmzsAsGssqgJwRg13hwfVrD3` — READY for the reviewed feature-branch head.
- Production deployment: `dpl_4w9btLRZkVAbMFuLRbsRFDm1MDSj` — READY; deployed commit matches `f574ef9ba3459fc6741275693d0e9ade49c4a1d3`.
- Unit tests: 177 passed across 29 test files.
- TypeScript: `tsc --noEmit --pretty false` passed.
- Search-index generation: 142 CredoNomics entries.
- Automated IPO dashboard generation: 41 records.
- Next.js production build: completed; 344/344 static pages generated.
- Existing non-blocking CSS/autoprefixer, React Hook and image-optimization warnings remain.

### Public verification limitation

Vercel reports the production deployment READY and both `credonomics.in` and `www.credonomics.in` aliases assigned to that deployment. However, the independent public-page checker did not verify the new article:

- The new article URL returned Internal Error.
- Research Watch hub and November bulletin still displayed the 21 November publication snapshot and did not show the new ICICI guide.
- Homepage showed the previous Research Watch card list.
- Public search and sitemap XML fetches returned Internal Error.
- The direct Vercel deployment URL was not accessible through the public checker.
- Vercel runtime-error query for the new route returned no runtime errors in the checked one-hour window; runtime-log query for the latest 15 minutes returned no matching error/fatal entries.

Therefore this release is **merged and deployed to a READY Vercel production deployment, but public rendering is not independently verified**. No DNS, cache, routing, alias, protection or infrastructure changes were made to force visibility. Do not describe the new article as publicly live until the article, hub and bulletin render the new record.

### Automation and scope safeguards

- Research Watch task `6adc4a968f4881919162894e39d400bc` remains disabled; latest recorded result available in this review is 29 October 2026.
- CredoNomics Daily Research task `6adbd4ecb2e48191960ca0a36ac53f91` was already disabled; last recorded run was 8 November 2026. It was not re-enabled.
- No automation schedules were changed.
- No payments, authentication, customer/financial records, infrastructure, secrets, paid resources or card-ranking formulas were changed.
- No external messages or comments were sent.


## 25 November 2026 — product-specific Special Needs correction

A fresh recheck of the issuer's current domestic schedules found that the earlier summary grouped distinct Special Needs products too broadly. The existing article is corrected rather than creating a duplicate.

- Original article publication date: 23 November 2026.
- Recheck date: 25 November 2026.
- Separate announcement date: not stated in the issuer schedules.
- Effective date: 1 December 2026.
- Base `main` SHA for this correction: `705ed361304c8717021580addbbd137f99e7ced5`.
- Exact rollback reference: `backup/pre-icici-savings-special-needs-20261125-1654`.
- Feature branch: `research-watch/icici-savings-special-needs-20261125-1654`.
- Data correction commit: `1525a91e13dbe95f8ca41d1a8bd00521331a4e8c`.
- Content PR #182: merged; merge commit: 8c7f7171b3e1bec7168e653adff308bbf8a254e5. Feature-branch head reviewed: 220eca31fa08cb4896869fa355a3b5eb2d3fff49.

### Newly verified schedule

ICICI Bank's separate **Savings Account for Unlearned (Special Needs)** schedule contains a dated Annexure 1 effective 1 December 2026. It is distinct from the Special Needs Savings schedule for visually impaired/incapacitated customers.

For the Unlearned schedule, the annexure states:
- Three complimentary branch cash-deposit transactions per month, then ₹150 per transaction.
- Three complimentary branch cash-withdrawal transactions per month, then ₹150 per transaction.
- ₹1 lakh monthly value limit for each category; above it, ₹4 per ₹1,000 or ₹150, whichever is higher.
- For financially caused ECS/NACH returns: first ₹500; second and third ₹550 each; maximum three instances per month for the same mandate.
- Applicable taxes are additional.

### Corrected product distinctions

- BSBDA/PMJDY: cash transaction charges remain nil; the 1 December annexure changes ECS/NACH return fees.
- Special Needs Savings for visually impaired/incapacitated customers: the checked schedule lists Home Branch cash transaction charges as nil; its 1 December annexure changes ECS/NACH return fees.
- Savings Account for Unlearned (Special Needs): separate schedule; cash and ECS/NACH revisions both apply.
- Salary Account for Visually Impaired: a separate salary product with the cash-charge revision.
- The article does not generalise one Special Needs product's tariff to another.

### Additional exact primary source

- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/iterate-savings-account-socs.pdf — ICICI Bank Savings Account for Unlearned (Special Needs), Annexure 1, PDF page 6.

The article's checked date is updated to 25 November while its original 23 November publication date and 1 December effective date are preserved. The issuer documents do not state a separate announcement date.

### Validation and release evidence

- Unit tests: 177/177 passed across 29 test files.
- TypeScript: tsc --noEmit --pretty false passed.
- Production build: Next.js 15.5.28 completed; 353 static pages generated; 41 IPO dashboard records and 149 search entries generated.
- Vercel production deployment: dpl_Dcs4eTqZmK2kq9MAX7yendsnAvCe, state READY, aliases assigned to www.credonomics.in and credonomics.in; deployed commit matches main at 8c7f7171b3e1bec7168e653adff308bbf8a254e5.
- Non-blocking existing CSS/autoprefixer, React Hook and image-optimization warnings remain.
- Public article fetch after deployment still returned the pre-correction snapshot (23 November checked date and old broad Special Needs wording). Cache-buster requests and the preview hostname returned Internal Error. The Research Watch hub, November bulletin and homepage returned HTTP 200 but their text snapshots did not establish the correction. Public search and sitemap fetches returned Internal Error. Therefore the correction is merged and deployed READY but public rendering is not independently confirmed.
- No cache purge, DNS, routing or infrastructure changes were attempted.
- No payment, authentication, customer/financial-record, infrastructure, secret, paid-resource or card-ranking changes are included.
