# Research Watch publication record — South Indian Bank bulk-deposit rates

## Editorial decision

Publish one narrowly scoped Bank Deposits update for South Indian Bank's current bulk term-deposit schedules for resident and NRE depositors placing ₹3 crore or more. The official interest-rate page lists separate callable and non-callable tables, with amount bands up to ₹200 crore and above.

This is a current rate-schedule update, not a claim that every rate increased. The bank page states that the tables are effective 24 November 2026 but does not state a separate announcement date. No announcement date or before/after comparison is inferred.

## Dates and affected audience

- Editorial check: 24 November 2026.
- Publication date: 24 November 2026.
- Effective date stated on the bank page: 24 November 2026.
- Separate announcement date: not stated by the issuer page.
- Affected audience: resident and NRE depositors considering South Indian Bank term deposits of ₹3 crore and above.
- The page has a separate retail schedule for deposits below ₹3 crore; this guide does not apply the bulk rates to smaller deposits.

## Primary-source verification

1. South Indian Bank official interest-rate page:
   https://www.southindianbank.bank.in/quick-links/interest-rates/deposits

   Checked sections:
   - Resident callable bulk deposits, effective 24-11-2026.
   - NRE callable bulk deposits, effective 24-11-2026.
   - Resident non-callable bulk deposits, effective 24-11-2026.
   - NRE non-callable bulk deposits, effective 24-11-2026.

2. DICGC official FAQ:
   https://www.dicgc.org.in/FAQs

   The FAQ states a maximum of ₹5 lakh per depositor per bank for principal and interest held in the same right and capacity, and lists deposits received outside India among exclusions. The article does not assert DICGC coverage for a specific NRE placement.

## Verified schedule details

- All four bulk tables cover amount bands from ₹3 crore to below ₹5 crore, ₹5–10 crore, ₹10–25 crore, ₹25–50 crore, ₹50–100 crore, ₹100–200 crore and ₹200 crore or more.
- Resident callable short-tenor rates vary by amount band. For ₹3–5 crore: 7–14 days 5.50%, 15–30 days 5.60%, 31–60 days 5.70% and 61–90 days 5.80%. For ₹25 crore and above, the same four tenors are 6.30%, 6.45%, 6.55% and 6.75%.
- Resident callable rates include 7.00% for 91–180 days and 366–389 days across the listed amount bands.
- NRE callable rates include 7.00% for 366–389 days, 6.30% for 390 days and 6.05% for above 390 days to 2 years. The table shows 6.00% for above 2 years to less than 3 years and for 3 years.
- Resident and NRE non-callable schedules both show a highest listed rate of 7.15% for 366–389 days. They show 6.30% for 390 days, 6.05% for above 390 days to 2 years and 6.10% for 3 years.
- The bank states no additional interest for senior citizens on deposits of ₹3 crore and above.
- Callable bulk deposits carry a 1% premature-closure penalty. Non-callable deposits cannot be prematurely withdrawn until maturity.
- The bank says rates may change without notice.
- No previous-rate comparison is asserted because the checked official page provides the current schedules, not a comparable prior table.

## Website implementation

- One source-backed WatchItem is included in `app/data/research-watch.ts`.
- Checked/publication date and effective date are 24 November 2026; no separate announcement date is invented.
- Article route: `/research/watch/south-indian-bank-bulk-fd-rates-3-crore-plus-november-2026`.
- Existing data-driven Research Watch flow supplies the hub, homepage brief and November bulletin.
- The existing prebuild search-index generator reads Research Watch entries; `app/sitemap.ts` imports the same data and adds each article URL.
- Existing Research navigation already links to Research Watch.
- No card or fund page is directly affected. No card ranking, reward valuation or formula is changed.

## Repository, PR and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `b73076e61628330dd67aed191aced2c59f07bcde`
- Rollback branch: `backup/pre-sib-bulk-fd-20261124-2119`
- Content branch: `editorial/sib-bulk-fd-20261124-2119`
- Content PR: [#167](https://github.com/aqdas1820/credonomics-site/pull/167) — merged.
- Reviewed PR head: `2124824be2eb2d611f6e2a986bcf4a51f6775f62`
- Content merge / production commit: `ec9018a399108e003ababc87b02c1cb58d1c5ed8`

## Build and production evidence

- Preview deployment: `dpl_9aocHReC5aEzsbg1nVMo1iK18eWz` — READY, commit `2124824be2eb2d611f6e2a986bcf4a51f6775f62`.
- Production deployment: `dpl_GTVcNj9g7xyDUwS7YyLR8s7ZhscS` — READY, target production.
- Production deployment's Git source commit matches main at the content release SHA `ec9018a399108e003ababc87b02c1cb58d1c5ed8`.
- Vercel reports `www.credonomics.in` and `credonomics.in` aliases assigned.
- Unit tests: 177 passed across 29 files.
- TypeScript: `tsc --noEmit` completed successfully; the prebuild proceeded to data generation and Next.js build.
- IPO dashboard generator: 41 records.
- Search-index generator: 147 entries.
- Production build: completed; Next.js generated 351 static pages and included the Research Watch dynamic article route group and `/sitemap.xml`.
- Existing non-blocking warnings remain: Autoprefixer flex-start/flex-end compatibility warnings, React Hook dependency warnings, image-element warnings and webpack cache serialization warnings.

## Public verification status

**Public rendering is not independently confirmed. Do not treat this release as publicly verified.**

After the production deployment reached READY:
- The new article URL returned Internal Error from the public fetcher.
- Research Watch and the November bulletin returned cache-miss/internal errors.
- `/sitemap.xml` returned Internal Error.
- The homepage returned an old crawl snapshot from three months earlier and did not establish current release visibility.
- The Vercel deployment API confirms the production deployment is READY and aliases are assigned, but the Vercel deployment file-tree API returned 404 (file tree unavailable). This is not a public-page verification.

No speculative DNS change, cache purge, routing change or infrastructure modification was attempted. The release is recorded as deployed to a READY production deployment, with public visibility unconfirmed.

## Other research decisions

- The 24 October initial batch was rechecked against current issuer/fund documents: IDFC IndiGo international rewards, Amex November MITC, the two HDFC scheme notices, Tata Neu HDFC manual claims and SBM ZET fees. SBM ZET's effective date remains HOLD; no blanket refund or devaluation inference was made.
- A reported RBL utility/rental reward restoration and fee-removal claim remains HOLD because no current official issuer notice or matching current MITC was independently verified.
- Union Mutual Fund merger and Axis MF scheme-specific subscription restriction candidates remain HOLD where the original official annexure could not be read.
- No ranking formula or valuation was changed.

## Scope safeguards

No payment, authentication, customer/financial-record, infrastructure, secret or paid-resource file was changed. No card/fund ranking formula, reward valuation or financial-service workflow was changed. No external messages or comments were sent. No automation schedules were changed.

The Research Watch task record remains disabled (last recorded run 29 October 2026). The daily 10 AM research report record also remains in its pre-existing disabled state (last recorded run 8 November 2026); it was not re-enabled or rescheduled.
