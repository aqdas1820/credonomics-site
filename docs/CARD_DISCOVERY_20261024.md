# Card discovery and device wallet — 24 October 2026

Base release: `8c85871ccd760b9238e31738a13f4b54fedac90f`.
Branch: `feature/competitor-inspired-card-tools-20261024`.

## Research and implementation

Reviewed https://cardadvisor.in/ and https://cardmaven.in/ on 24 October 2026. CardAdvisor provides spending-led discovery, card comparisons and a browser wallet. Card Maven organizes discovery around needs, banks and head-to-head comparisons. Adapted these interaction patterns to CredoNomics' existing Midnight Intelligence styling and normalized issuer dataset; no competitor text, rankings, ratings, artwork or product terms were imported.

- `/cards`: first-card / next-card / held-card entry paths and four deep-linked comparisons using existing verified records.
- `/cards/wallet`: search and save public card IDs, remove or clear cards, switch categories, compare the selected wallet through the existing annual-value engine. Local-only persistence, validation of saved IDs, storage failure feedback, and cross-tab synchronization. No card/account numbers, sign-up, external requests or server writes.
- `/cards/all`: annual-fee ceiling, fee/date/name sorting, result announcements and empty-result reset. The zero-fee filter describes the normalized annual fee; it does not assert that every possible issuer charge is zero.
- Homepage discovery links to the wallet; the generated search index includes its route.

## Financial interpretation

Category results are alternative single-card scenarios, not marginal purchase routing recommendations or an optimized combined-wallet total. The existing saved spending profile, issuer source links, caps, fee GST and waiver model are reused. Missing or held-back category terms are explicitly excluded, not treated as zero reward. Partner and merchant assumptions remain visible in ranking notes. Existing dataset verification dates are preserved; this UX change does not claim a fresh product-term audit.

## Validation

- TypeScript check passed.
- 140 unit tests passed, including corrupt persistence, duplicate/unknown IDs and ranking eligibility.
- Production build passed (182 static pages); existing CSS/browser-support and legacy lint warnings remain.
- Browser QA unavailable: managed `sites-preview` injected `--host` and `--strictPort`, which Next.js 14 rejects. The preview stopped. No application dev command was changed to compensate for preview infrastructure.
- React review: SSR-safe initial state; browser reads inside effects; versioned minimal storage; storage listeners cleaned up; labeled native controls; keyboard focus styles; responsive layouts; reduced-motion handling.

## Release and rollback

This branch leaves production/main, payments, authentication, databases and paid resources unchanged. Merge/deployment remains a separate release action under the existing no-automatic-publishing constraint. To discard this proposal, close the PR; the base production release remains intact. After an approved merge, reverting its merge/squash commit restores the prior UX. Wallet persistence contains public product IDs only and is harmless if the route is rolled back.
