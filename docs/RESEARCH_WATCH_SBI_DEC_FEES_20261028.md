# SBI Card transport/fuel fees — 28 October 2026

Pre-release main: `ca831d012ec9bc1f09e547adcd6285bc253a75a0`.
Rollback: `backup/pre-sbi-dec-fees-watch-20261028` (same exact main).

## Verification and selection

Research Watch matching completed run/result `e798e30e-b31c-8333-a2ac-c51a176c984a` identifies the new material notices. Independently read the current originals:
- https://www.sbicard.com/en/customer-notices.page
- https://www.sbicard.com/en/most-important-terms-and-conditions.page

First two notices are website-dated 27 October; effective 1 December. Transport: 1% of every individual transaction exceeding ₹30,000 under MCCs 4111/4784/4131. Fuel: combined billing-cycle transactions under MCCs 5172/5541/5542/5983 above ₹50,000 trigger 1% on total fuel spending. No calendar-month or excess-only threshold inferred. Current MITC does not yet list these incoming category fees; it does describe separate acquiring-bank fuel surcharge, product-specific waiver and a general applicable-tax clause. Do not assume waiver offsets new spend fee. Product exemptions, caps, reversal/first-cycle handling and specific tax-inclusive amount remain unconfirmed; no universal nil-to-1% history or ranking revision.

Read current main initial-batch Watch entries, October bulletin and prior release notes, inspect public Watch/bulletin; targeted repo search found no December SBI transport/fuel coverage. Fresh RBI/SEBI listings establish no additional selected material retail change since prior publication. Existing scheme/legal/refund HOLDs unchanged.

## Integration and release record

One data-driven guide reaches homepage, Cards, research, Watch, bulletin and eight existing SBI detail pages via the established cardIds pattern. No holderNotice inserted that would mislabel cards legacy; no numeric card/ranking data changed. Latest publication/check dates advance to 28 October; old guide dates retained. Search/sitemap/navigation use existing patterns. No protected systems, payments, authentication, financial/customer records, infrastructure, secrets, paid resources, schedules or daily-report changes.

The release PR titled “Publish SBI Card December transport and fuel fee guide” records exact reviewed head/tested tree, validation, preview READY, production READY/deployed main SHA and public page/source checks. This note plus that PR form publication evidence. Revert release or restore preserved base for rollback; no migration.

Validation PASS: 143 tests/23 files, separate post-build TypeScript, production build, diff check and generated guide/date/MCC/threshold/scope/source plus eight SBI detail pages and homepage/Cards/research/Watch/bulletin/search/sitemap assertions. Initial typecheck raced regeneration of .next/types; final separate run completed successfully. React review: TSX edits are static date strings only; component/hook/accessibility/bundle behavior unchanged.
