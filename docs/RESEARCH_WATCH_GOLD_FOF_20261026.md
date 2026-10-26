# Named gold FoF subscription restrictions — 26 October 2026

Pre-release main: `42bfa97b9c13ae101c511cb2da5c7ed78ee63bae`.
Rollback: `backup/pre-gold-fof-subscriptions-20261026`.

## Selection and sources

Recorded Research Watch result `adec439f-c3bc-8326-9ad8-5fab4e364af3` identified two HDFC schemes and referred to an intermediate Baroda BNP Paribas finding. Later recorded run `294f9a00-97d0-832a-9b23-1b986461a1de` was no-update; its retained meaningful result is not attributed to that later run. Both issuer documents were independently opened in this publication review, so the intermediate candidate is not missed. Current main, Watch data, public hub, October bulletin and prior publication notes were re-read; no matching gold-FoF restriction guide was found. Two unrelated bot updates since the last editorial release are preserved in the base.

- https://files.hdfcfund.com/s3fs-public/2026-10/1374-%20Addendum-%20Temporary%20restrictions%20on%20subscriptions%20in%20select%20schemes_1.pdf
- https://www.hdfcfund.com/statutory-disclosure/form-disclosures/addenda-notices
- https://www.barodabnpparibasmf.in/assets/download_documents/Addendum_no_95_2026-Suspension_of_Transactions-Gold_ETF_FoF_20568.pdf
- https://www.barodabnpparibasmf.in/downloads/notice-cum-addenda

HDFC's one-page 15 October addendum explicitly says after 3 pm on 15 October for fresh subscriptions/switch-ins and fresh systematic registrations; existing systematic transactions registered/received prior to the effective date continue, no redemption restriction. Baroda BNP Paribas's one-page Addendum 95/2026 has a different cutoff (close of business 15 October), separately lists new SIP/STP restrictions, continues existing SIP/STP/SWP under applicable conditions and permits redemption/switch-out under SID/KIM. Do not impose HDFC's precise cutoff on Baroda or infer ambiguous intraday eligibility. Both say until further notice. Current notice listings and targeted resumption searches did not establish a reopening date.

No industry-wide 17-AMC comparison: BSE annexure and other schemes are outside this verified scope. No refund process inferred. UPI MDR timing remains HOLD pending reconciliation of current FAQ/implementation notice; the older 13 October deferral alone does not establish current commencement. RBI/SEBI fresh listings did not produce another selected consumer action update.

## Implementation and validation

One data-driven guide covers exactly three named FoFs and uses a Subscription restrictions status. Existing homepage, mutual-fund overview, hub, bulletin, research navigation, generated search and sitemap carry it. No separate detail route exists for these three schemes. Existing guides keep their dates; no ranking, payment/authentication, customer or financial records, infrastructure, secrets, paid resources, schedules or daily-report changes.

Validation passed: 143 tests across 23 files; TypeScript; production build (existing lint warnings only); git diff --check. Built article assertions cover both cutoffs, dates, status, named scope and source links. Homepage, mutual-fund overview, Watch hub, bulletin, generated search and sitemap contain the guide. The exact reviewed head, Vercel preview and production READY/deployed commit, public-page/source-link verification and preserved rollback reference are recorded in the release PR. Revert the release or restore the backup reference using the established workflow; no migration.
