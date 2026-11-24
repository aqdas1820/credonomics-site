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

- Add one source-backed WatchItem to `app/data/research-watch.ts`.
- Use checked/publication date 24 November 2026 and effective date 24 November 2026; do not invent a separate announcement date.
- The existing data-driven article route is `/research/watch/south-indian-bank-bulk-fd-rates-3-crore-plus-november-2026`.
- The existing Research Watch data flow supplies the hub, homepage brief and November bulletin.
- The existing prebuild search-index generator reads Research Watch entries; `app/sitemap.ts` imports the same data and adds each article URL.
- Existing Research navigation already links to Research Watch.
- No card or fund page is directly affected. No card ranking, reward valuation or formula is changed.
- No payments, authentication, customer/financial records, infrastructure, secrets or paid resources are changed.

## Repository and rollback

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit main SHA: `b73076e61628330dd67aed191aced2c59f07bcde`
- Rollback branch: `backup/pre-sib-bulk-fd-20261124-2119`
- Feature branch: `editorial/sib-bulk-fd-20261124-2119`
- Editorial check: 24 November 2026.

## Release evidence

Preview build, unit tests, TypeScript, production build, PR review/merge, production deployment and public-page/source-link verification are pending. This record will be updated with exact PR, commit, deployment and verification results. No release is considered public until the article, Research Watch hub, homepage, November bulletin and primary-source links are checked against the production domain.

## Scope safeguards

No payment, authentication, customer/financial-record, infrastructure, secret or paid-resource file is changed. No card/fund ranking formula, reward valuation or financial-service workflow is changed. No external messages or comments are sent. No automation schedules are changed.
