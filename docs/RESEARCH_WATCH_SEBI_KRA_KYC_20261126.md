# Research Watch release evidence — SEBI KRA KYC simplification

## Editorial decision

Published a new, source-verified consumer update for SEBI Circular **HO/38/14/(25)2026-MIRSD-POD3**, issued **25 November 2026**. The circular’s provisions take effect **24 December 2026**. Verification date: **26 November 2026**.

The update is limited to securities-market KYC. It does not claim that all financial-services KYC becomes universally portable, that every KYC record is validated, or that investors must immediately redo KYC.

## Published article

- Canonical route: https://www.credonomics.in/research/watch/sebi-kyc-kra-simplification-december-2026
- Research Watch hub: https://www.credonomics.in/research/watch
- November bulletin: https://www.credonomics.in/updates/2026-11
- Homepage: https://www.credonomics.in/

The article is data-driven through `app/data/research-watch.ts`. Existing Research Watch components feed the homepage, hub and month-specific bulletin. The build-time search-index generator reads the same data, and `app/sitemap.ts` includes every Research Watch slug. The existing navigation already links to Research Watch; no new navigation item or card/fund page was relevant to this general securities-KYC circular.

## Verified coverage and limitations

- Common supplementary KYC information is centralised at KRA level, with the prescribed three-working-day upload window and fields.
- Repeat mobile verification is optional only where the KRA already tags the number as both Aadhaar-seeded and verified.
- KYC portability is restricted to records whose prescribed paragraph 96/97 attributes have been source-verified, including either current or permanent address, and whose PAN–Aadhaar linkage is verified. Unvalidated records may still require additional information.
- Separate timelines for account closure, zero-balance mutual-fund folios and fetched KYC records that do not lead to account opening are retained.
- Name-change documentation, the narrow Karnataka/Punjab private-individual exception, the OCI/foreign-national resident address relaxation and the FATF-compliant PROI applicability carve-out are stated with their conditions.
- The existing 4 November 2026 digital-KYC-from-abroad article remains distinct. This 25 November circular concerns KRA data, validation and portability; it is not a duplicate or a replacement for the earlier digital-KYC notice.
- No card ranking, reward valuation or investment ranking formula was changed.

## Primary sources

1. SEBI circular PDF: https://www.sebi.gov.in/sebi_data/attachdocs/nov-2026/1795605346389.pdf
2. SEBI circular landing page: https://www.sebi.gov.in/legal/circulars/nov-2026/simplification-of-client-on-boarding-and-rationalisation-of-risk-management-framework-at-kyc-registration-agencies_105839.html
3. SEBI KYC Master Circular, 12 October 2023: https://www.sebi.gov.in/legal/master-circulars/oct-2023/master-circular-on-know-your-client-kyc-norms-for-the-securities-market_77945.html
4. Referenced SEBI FATCA/CRS circular, 11 November 2026: https://www.sebi.gov.in/legal/circulars/nov-2026/reporting-requirement-under-foreign-account-tax-compliance-act-fatca-and-common-reporting-standard-crs-revised-through-income-tax-act-2025-read-with-income-tax-rules-2026_105705.html
5. Referenced FATCA/CRS circular PDF: https://www.sebi.gov.in/sebi_data/attachdocs/nov-2026/1794392501415.pdf

## Git and rollback evidence

- Pre-edit main SHA: `e203159b0069a7a5be8da0751a4200edc93cbcbf`
- Rollback branch created at that exact SHA: `backup/pre-sebi-kra-20261126-0217`
- Feature branch: `research-watch/sebi-kra-kyc-simplification-20261126-0217`
- Content PR: https://github.com/aqdas1820/credonomics-site/pull/184
- Merge commit / current main at content release: `c2f1bf05d29c8344aad8ecf696d3174a78a7b087`

## Build and deployment evidence

- Preview deployment: `dpl_jz54bcZ2N5GN12qaUo5BL4VsFuLD`, READY, commit `2d54cc86e6fa83cfce3ed75cc0c234fa57e43b88`.
- Production deployment: `dpl_G37swKeTfMFv9P9JvwotuhRByL82`, READY, commit `c2f1bf05d29c8344aad8ecf696d3174a78a7b087`.
- Production aliases reported by Vercel: `www.credonomics.in` and `credonomics.in`.
- Unit tests: 29/29 files and 177/177 tests passed.
- TypeScript: `tsc --noEmit --pretty false` completed without reported errors.
- IPO dashboard generator: 41 records.
- Search-index generator: 150 entries.
- Next.js production build: completed; 353/353 static pages generated.
- Existing non-blocking CSS Autoprefixer, React Hook and image-optimization warnings remain.

## Public-render verification limitation

The Vercel production deployment is READY and its production aliases are assigned, but the public verification service did not confirm the new article route during this run:

- The public Research Watch hub and November bulletin still returned a snapshot showing latest check/publication as 25 November 2026, without the new 26 November article.
- The homepage snapshot also still showed latest check 25 November 2026.
- Direct fetch of the new article route failed in the public checker.
- `/sitemap.xml` and the public search route returned Internal Error through the checker.

Therefore this release is **merged and deployed READY, but public visibility is not independently confirmed**. No cache purge, DNS, routing or infrastructure change was attempted. Recheck the public route and generated sitemap/search surface before describing the article as publicly live.

## Scope and safeguards

Only the Research Watch data record and this release-evidence document are in scope. Payments, authentication, customer/financial records, infrastructure, secrets, paid resources and ranking formulas were not changed. No external messages or comments were sent.

Research Watch source task `6adc4a968f4881919162894e39d400bc` remains disabled with its last recorded result dated 29 October 2026. The saved daily 10 AM research-report record is also disabled (last recorded run 8 November 2026). Neither task status nor any automation schedule was changed in this release.
