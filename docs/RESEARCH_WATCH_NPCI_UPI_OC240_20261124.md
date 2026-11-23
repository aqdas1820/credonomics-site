# Research Watch publication record — NPCI UPI dispute-rule changes from 25 November 2026

## Editorial decision

Publish one previously missed, source-verified consumer-finance update: NPCI/UPI/OC No. 240/2026–27, dated 4 November 2026, with URCS implementation from 25 November 2026. The circular changes specified bank/app back-office dispute names, reason codes and evidence mappings. It does not create a new customer-facing refund process, refund eligibility rule, complaint channel, deadline or compensation amount.

This was not present in the current `app/data/research-watch.ts`, the public Research Watch hub or the November bulletin before this change. The existing OC 241 P2M-routing article is separate and remains upcoming for 23 December 2026.

## Dates and audience

- Announcement date: 4 November 2026.
- Editorial check: 24 November 2026.
- URCS implementation date: 25 November 2026.
- Affected audience: UPI users who may need to dispute merchant payments, duplicate/multiple transactions, excess charges, wrong payments, cancelled/returned/defective/undelivered goods or services, or fraud-related debits.
- Primary addressees: UPI member banks and UPI application providers.
- Consumer status: specified internal URCS processing changes; no new customer-facing entitlement inferred.

## Reconciled primary documents

1. NPCI/UPI/OC No. 240/2026–27, dated 4 November 2026:
   https://www.npci.org.in/uploads/UPI_URCS_OC_240_Standardization_in_Dispute_Management_6f4a6542c3.pdf

2. NPCI/UPI/OC No. 241/2026–27, also dated 4 November 2026, separately implementing P2M routing from 23 December 2026:
   https://www.npci.org.in/uploads/UPI_URCS_OC_241_Revision_of_dispute_routing_logic_for_UPI_P2_M_transactions_in_URCS_1c6c076393.pdf

3. NPCI official UPI circular register:
   https://www.npci.org.in/circulars/upi

### Key reconciliation points

- OC 240 renames “Wrong Credit Chargeback” to “Wrong Payment – Reversal Request” for the listed raise/acceptance/rejection flags and permits that request and Fraud Chargeback for deemed-approved transactions after TCC updates.
- OC 240 revises codes 1063, 1085 and 131, discontinues code 1084 for Chargeback Raise (flag B), and adds specified codes for overcharges, duplicate/multiple payments, cancelled/returned, defective or undelivered goods/services, excess charges and Government Revenue Collection Payments.
- OC 240’s evidence table is a bank/app URCS workflow mapping. It does not require every consumer to file an FIR or NCRP report.
- OC 241 separately revises the 1061 and 1096 descriptions for its P2M routing specification and has a 23 December implementation date.
- OC 241 Annexure I still lists code 1084 for Online/UDIR Refund and Credit Adjustment. Therefore OC 240’s 1084 discontinuation is specific to Chargeback Raise (flag B), not global.
- OC 240’s Annexure TAT column is not represented as a new customer-facing refund SLA. OC 241 expressly says existing RBI-prescribed TATs and customer compensation remain unchanged for its routing change.
- No refund eligibility, process, new customer deadline or compensation entitlement is inferred.

## Website implementation

- Added the new item to `app/data/research-watch.ts` using the existing `WatchItem` data-driven article pattern.
- Set announcement date to 4 November, checked/published date to 24 November, and URCS event/effective date to 25 November.
- Advanced `WATCH_CHECKED_AT` to 24 November 2026.
- Existing data flow supplies the individual article, Research Watch hub, homepage and November bulletin.
- Existing production build regenerates the search index and sitemap.
- No separate navigation item is required; the existing Research navigation links to Research Watch.
- No card/fund record, card-ranking formula, reward valuation, payment, authentication, customer/financial record, infrastructure, secret or paid-resource file was changed.

## Repository and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `5f7d6351503863f45addc4ab2e4dd067f546d274`
- Rollback branch: `backup/pre-npci-upi-oc240-20261124-0046`
- Feature branch: `editorial/npci-upi-oc240-20261124-0046`
- Editorial check: 24 November 2026.

## Final release evidence — 24 November 2026

### GitHub review and merge

- Content PR: https://github.com/aqdas1820/credonomics-site/pull/157
- Reviewed PR head SHA: `253bf5d318c180d8825049a58450d594cffb368d`
- Merge commit: `327aa375ae6580b514fc75677f515f010d17c259`
- Main SHA immediately after content PR #157 merge: `327aa375ae6580b514fc75677f515f010d17c259`
- PR state: merged; merge used the exact reviewed head SHA.
- Pre-edit main SHA: `5f7d6351503863f45addc4ab2e4dd067f546d274`
- Exact pre-edit rollback branch: `backup/pre-npci-upi-oc240-20261124-0046`
- Evidence-only edit base SHA: `327aa375ae6580b514fc75677f515f010d17c259`
- Evidence-only rollback branch: `backup/pre-npci-upi-oc240-evidence-20261124-0058`
- Evidence-only feature branch: `editorial/npci-upi-oc240-evidence-20261124-0058`

### Vercel validation

- Project: `prj_NXyFJfuc7NwEmp5ws9CASP33Ybg0`
- Team: `team_p0ZA2bmlk6y1pzjqaAMCoWub`
- Preview deployment: `dpl_HGDCzEFoioav4EP62K7zbvVi574s`
  - State: READY
  - Commit: `253bf5d318c180d8825049a58450d594cffb368d`
  - Preview URL: https://credonomics-site-ne3jcf2en-aqdasshaikh1820-9566s-projects.vercel.app
- Production deployment: `dpl_5i52qtvAdf3f1pcCjo4toP8jqmoK`
  - State: READY
  - Target: production
  - Deployed commit: `327aa375ae6580b514fc75677f515f010d17c259`, matching final main at deployment time
  - Assigned aliases reported by Vercel: https://www.credonomics.in and https://credonomics.in
  - Deployment record: https://vercel.com/aqdasshaikh1820-9566s-projects/credonomics-site/5i52qtvAdf3f1pcCjo4toP8jqmoK

### Build checks

- Unit tests: 177 passed across 29 test files.
- TypeScript: `tsc --noEmit --pretty false` completed successfully; the chained prebuild continued to dashboard/search generation.
- IPO dashboard: 41 automated records generated.
- Search index: 143 entries generated.
- Next.js production build: completed successfully.
- Static pages: 347/347 generated.
- The build route manifest includes `/research/watch/npci-upi-dispute-reason-codes-effective-25-november-2026`.
- Non-blocking existing warnings remain: Autoprefixer flex alignment compatibility, React Hook dependency warnings, `<img>` optimization warnings, and the existing edge-runtime page's static-generation limitation. No warning was introduced by the Research Watch data entry.

### Public visibility verification — not confirmed

The production deployment is READY, but the public content could not be confirmed live during this verification. The build's search-index generator writes `app/data/search-index.generated.ts`, and `app/sitemap.ts` imports `researchWatch` and adds each article slug; both build-time patterns include the new record.

- https://www.credonomics.in/research/watch — page fetch succeeded, but its visible snapshot still says latest check `2026-11-23`; the OC 240 entry is absent.
- https://www.credonomics.in/updates/2026-11 — page fetch succeeded, but its visible snapshot still says latest check `2026-11-23`; the OC 240 entry is absent.
- https://www.credonomics.in/ — page fetch succeeded, but its visible snapshot still says latest check `2026-11-23`; the OC 240 entry is absent.
- https://www.credonomics.in/research/watch/npci-upi-dispute-reason-codes-effective-25-november-2026 — public checker returned Internal Error.
- https://www.credonomics.in/search?q=NPCI — public checker returned Internal Error.
- https://www.credonomics.in/sitemap.xml — public checker returned Internal Error.
- The generated search index is `app/data/search-index.generated.ts`; the production prebuild generated 143 entries. The public `/search?q=NPCI` route returned Internal Error.
- Query-string cache-busting did not resolve the stale hub/bulletin/homepage snapshot or the article/search/sitemap fetch errors.
- The Vercel preview and deployment hostnames were also inaccessible to the public checker. A direct runtime `curl` attempt could not resolve the domain because outbound DNS is unavailable in that runtime; this is not evidence that the public DNS itself is broken.
- The official NPCI OC 240 and OC 241 PDFs and the NPCI UPI circular register were independently opened and checked.

**Release conclusion:** The content is merged into GitHub main and included in a Vercel production deployment marked READY, but the custom-domain public pages still return an older 23 November snapshot and the new article route is not independently retrievable. Do not describe the new article as publicly live until the hub, bulletin, homepage and individual route show the 24 November update. No cache purge, DNS, routing, middleware, infrastructure or secret changes were attempted.

### Research and automation record

- Research Watch task `6adc4a968f4881919162894e39d400bc` is disabled; its latest completed run was 29 October 2026. Its saved result contained one SEBI Direct Plan-default candidate on HOLD because the original SEBI PDF and implementing confirmation were not independently verified. It did not contain the 4 November NPCI OC 240 circular, which was independently found and reconciled against OC 241 in this publication.
- Daily report task `6adbd4ecb2e48191960ca0a36ac53f91` is disabled in the current automation record; last run 8 November 2026. It was not changed or re-enabled.
- The separate Publish CredoNomics Research automation remains enabled; its schedule and prompt were not changed.
- No automation schedules were changed.

### Scope safeguards

No card/fund data, card-ranking formulas, reward valuations, payments, authentication, customer/financial records, infrastructure, secrets or paid resources were changed. No external messages or comments were sent.
