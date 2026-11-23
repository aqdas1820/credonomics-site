# ICICI savings-account charges — editorial publication record

## Status

Prepared on the feature branch for the 1 December 2026 tariff revision. This is a new domestic savings-account guide, not a change to card rankings or account data.

- Repository: `aqdas1820/credonomics-site`
- Base `main` SHA: `a0638e8be362c0c92e75f982fc809c48806b470c`
- Rollback reference: `backup/pre-icici-savings-charges-20261123-1920`
- Feature branch: `editorial/icici-savings-charges-20261123-1920`
- Editorial check: 23 November 2026
- Announcement date: not separately stated in the checked issuer documents
- Effective date: 1 December 2026

## Verified change

For the checked Regular Savings and Senior Citizen/Pensioner schedules, the value-based charge on eligible branch cash deposits, Cash Recycler deposits and branch cash withdrawals changes from ₹3.50 to ₹4 per ₹1,000 after the monthly ₹1 lakh value limit, or ₹150 whichever is higher. The three-free-deposit and three-free-withdrawal count allowances and the separate ₹150 count-based charge remain. Wealth/Private Banking accounts meeting the stated criteria have separate 15-transaction and ₹15 lakh value limits.

For financial ECS/NACH debit returns, the first return remains ₹500 and the second and third become ₹550 each, capped at three recoveries per month for the same mandate.

## Product-specific reconciliation

- Current Regular Savings schedule: accounts opened or converted from 1 August 2025; salary, senior-citizen/pensioner, BSBDA/PMJDY and disability-related accounts are excluded from this schedule.
- Legacy Regular Savings schedule: separate discontinued-product schedule contains the same 1 December cash and ECS/NACH annexure.
- Current and legacy Senior Citizen/Pensioner schedules: both contain the 1 December annexure.
- BSBDA/PMJDY: cash transaction charges remain nil; the ECS/NACH return schedule changes.
- Salary, NRI and disability-related schedules are not generalized. The separate NRI December notice was not independently reconciled and remains outside this article.

## Exact primary sources

- https://www.icici.bank.in/about-us/notice-board
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/savings-account.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/regular-savings-account-socs.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/senior-savings-account.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/senior-citizen-regular-savings-account-socs.pdf
- https://www.icici.bank.in/content/dam/icicibank/india/managed-assets/docs/pdf/basic-savings-bank-deposit-account-socs.pdf

## Implementation pattern

The new entry is added to `app/data/research-watch.ts`. Existing `ResearchWatchBrief` data flow supplies the Research Watch hub, homepage and November bulletin. The existing search-index generator enriches Research Watch entries, and `app/sitemap.ts` adds every Research Watch article route. No separate navigation item, card-ranking change, card/fund data edit or payment/authentication change is required.

## Validation and release evidence

- Unit tests, TypeScript and production build: pending PR validation.
- PR number and reviewed head SHA: pending.
- Merge commit and production deployment ID: pending.
- Public article, hub, bulletin, homepage, search-index and sitemap verification: pending.
