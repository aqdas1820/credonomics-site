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

- Unit tests, TypeScript and production build: pending final-head PR validation.
- PR #152; final reviewed head SHA: pending.
- Merge commit and production deployment ID: pending.
- Public article, hub, bulletin, homepage, search-index and sitemap verification: pending.
