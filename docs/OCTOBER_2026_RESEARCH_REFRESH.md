# October 2026 public-data research refresh

## Preserved production state

The source baseline is `f2f41546350dee37378b9119d0b2fd6bffe864d0`, preserved remotely as `backup/pre-research-refresh-20261023`. Local research work mirrors that exact source tree before edits. No production release is included in this task.

## What changed

- A homepage October bulletin and `/updates/2026-10` distinguish issuer-effective changes, model corrections, current terms checks and future changes. Each item links to its primary issuer source and retains unknown effective dates as unknown.
- Card ranking comparisons use the same explicit scenario before and after the audit. The prior published model is preserved as JSON, identified by its baseline SHA. These are model-audit comparisons, not historical market rankings or personalized recommendations.
- Eleven card records have named fields reviewed, with the SBI MILES correction also applied to MILES PRIME. Original full-record verification dates remain visible. The remaining fields/cards are not blanket certified as current.
- Corrections cover Millennia's earning/redemption distinction, ACE's combined cap, Airtel's base-cashback dependency, HSBC's current shared cap/categories, Flipkart SBI's quarterly ceiling, Swiggy minimum transactions, FIRST Power+ caps and UPI units, Tata Neu Infinity SBI's UPI cap, SBI MILES redemption units, and IndianOil HDFC point conversion.
- FIRST Power and IndiGo categories whose required caps/rupee valuations are incomplete are held from rupee rankings. Their research records remain available. Club Vistara IDFC FIRST is excluded from catalogue recommendations after its issuer-confirmed programme closure.
- Catalogue discovery is labeled as unverified extraction/relevance, separate from modeled annual-value rankings. The fee parser no longer treats the K in “Know More” as a thousand multiplier. Fresh source failures retain earlier issuer records rather than certifying them anew.
- Six official HDFC September 2026 workbooks supplied 634 numeric Indian equity positions and 362 ISIN-based securities. Three positions published as `@` (less than 0.01% to NAV) remain explicitly unquantified in the source manifest. Equity totals reconcile to each workbook, allowing source rounding. Cash, debt, derivatives and non-equity assets are not represented by this equity view.
- All 18 historical monthly portfolio files remain byte-for-byte unchanged. The new import does not infer missing July/August positions or merge legacy NAME identities into ISIN identities. Calendar comparisons and cohort/identity checks prevent missing data from becoming fabricated accumulation or exit signals, including CSV output.
- Public Upstox instrument masters were refreshed through the existing fetch/validate/publish pipeline: 14,384 accepted identity records, 97,062 rejected input rows, zero duplicate published identities. This is independent of live quotes and retains the existing validator's scope.
- NSE IPO records and SEBI filing discovery were refreshed through existing public-data scripts. Source limitations such as unavailable BSE/SME responses remain visible.

## Coverage and preserved boundaries

`public/data/research-updates/site-data-audit-2026-10.json` enumerates all 53 route patterns and connected data families, source timestamps, counts, partial coverage and unchanged historical hashes. Dynamic card/issuer/category, stock, IPO and research routes share the relevant refreshed source modules. Company/policy pages and historical publication dates are preserved. Authentication, OTP, banking, payments, reconciliation, financial records and security controls were not changed or exercised.

`public/data/research-updates/changed-files-2026-10.json` enumerates the exact changed files, including new security detail records.

## Verification

- 136 unit tests across 21 files passed; TypeScript and the production build passed before hosted preview verification.
- New financial tests independently assert earning caps, conditional cashback, partner/base separation, point conversion, ranking exclusions, calendar-period selection, missing identities/cohorts and six portfolio reconciliations.
- Instrument staging validation passed. The existing mixed historical MF dataset remains PARTIAL. Validating new September data does not certify pre-existing historical extraction artifacts.
- Local Playwright browser execution remains unavailable because Chromium is not installed. Browser specifications are not represented as an automated pass.
- Hosted preview visual/interaction results, deployment SHA and remaining limitations are recorded in the pull request after verification.
- No full field Core Web Vitals or blanket WCAG 2.2 AA compliance claim is made. Existing build warnings outside the edited scope remain.

## Reproduce the data checks

```sh
npm test
npm run typecheck
npm run build
node scripts/research/audit-site-data.mjs
```

The XLSX importer accepts downloaded official files plus their exact source URLs and SHA-256 hashes in `sources.json`. It validates reporting month, ISIN checksum, duplicate scheme/ISIN pairs and equity totals before publication. It refuses to overwrite an existing monthly snapshot. Workbook formulas are not executed. Full historical holdings are never reconstructed from NAV snippets.

## Rollback

Before release, retain production and discard the research preview if needed. After any separately approved merge, prepare a development branch with `git revert -m 1 <research-merge-sha>`, run validation and release the revert with approval. Do not reset main over newer independent changes. The preserved f2f4154 baseline remains available for recovery.
