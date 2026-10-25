# Swiggy migration guide and legacy-card context — 25 October 2026

Base main: `c21bffd1f771e1e7db4ec012df5051bc184be00c`.
Rollback: `backup/pre-swiggy-migration-20261025`.

## Selection and verification

Latest recorded Research Watch result (25 October IST) identified a missing legacy Swiggy HDFC migration warning. Current main, live Watch hub, October bulletin, legacy card page and prior publication notes were inspected: no migration guide or phaseout context was present.

Primary notice: https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/personal-banking/discover-products/cards/credit-cards/swiggy-hdfc-bank-credit-card/pdf/faq-swiggy-card-upgrade-final.pdf

The full seven-page official FAQ was read; page 6 was visually verified for mandates, controls and issuance-date definition. The notice is published 30 September 2026; publication and verification of this guide are 25 October. The notice publication date is not treated as a universal customer migration effective date.

Questions 17–21 confirm phaseout and phased communications through March 2027 with remaining holders later, customer-specific timelines, Ornge default migration with 30 days' notice and old-card disablement at the earliest of first new-card transaction, 60 days from new-card issuance or expiry. Questions 23–26 confirm mandates/controls do not carry over, issuance rather than activation is the upgrade date, and a one-month cashback-query window. The guide gives a practical checklist, not personalized replacement advice.

Supporting official product pages were opened and verified as distinct variants:
- https://www.hdfc.bank.in/credit-cards/swiggy-ornge-hdfc-bank-credit-card
- https://www.hdfc.bank.in/credit-cards/swiggy-blck-hdfc-bank-credit-card

No replacement reward comparison or fee guarantee is published without full normalization. The old product page still carries legacy application and benefit copy; it does not override the explicit phaseout FAQ. Do not infer that every existing card has stopped working or assign one closure date.

## Implementation and scope

Add one Watch guide, linked to the legacy card detail; homepage, research hub and bulletin use the existing data-driven surface, search generator and sitemap. Add editorial holderNotice metadata separately from full-record fee/reward verification. Directory and every shared ranking/comparison/wallet result label the legacy estimate for existing holders and link to the checklist. Card details retain the historical record and show migration context; the curated next-card shopping pair uses Millennia instead of legacy Swiggy.

Existing holders can retain old benefits pending their own migration communication. Therefore the numerical legacy model remains available with an explicit scope warning; silently deleting it or applying Ornge terms to all holders would be inaccurate. Ranking formulas, caps, fee amounts and historical baseline remain unchanged. Replacement variants are not silently introduced into rupee rankings. No payment/authentication, financial records, infrastructure, secrets, paid resources or automation changes.

## Validation and rollback

Existing unit tests, TypeScript, production build and intended-head PR review are required. Built guide/status/source, context notices, stable original records and generated search/sitemap are checked. Vercel preview and production commit/READY plus live guide, card/detail/directory/result and entry-point checks are recorded in the release PR before reporting live.

Revert the release commit or use the backup reference. No data migration is required.
