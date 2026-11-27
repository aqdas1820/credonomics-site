# Research Watch release evidence — Puducherry DICGC clarification

**Review date:** 27 November 2026  
**Original article publication date:** 15 November 2026  
**Latest verification date:** 27 November 2026  
**Notice date:** 22 October 2026  
**Bank-specific date printed in the DICGC notice:** 5 December 2026 for claim/willingness submission  
**Conditional payment date printed in the notice:** 19 January 2027

## Editorial decision

This is a correction and re-verification of the existing Puducherry Co-operative Urban Bank guide, not a duplicate article. The item was already present in Research Watch and the November bulletin. The update preserves the original publication date, advances the checked date to 27 November, uses the exact PDF URL currently linked from DICGC's official press-release register, and clarifies the difference between the bank-specific notice and DICGC's general FAQ.

## What was rechecked

- DICGC Press Release 2026-2027/17, dated 22 October 2026, lists 5 December 2026 for claim/willingness submission and 19 January 2027 for payment, subject to the bank submitting its depositor list in the prescribed form and within statutory timelines and DICGC verifying the claim documents.
- The notice asks depositors of the named bank to submit officially valid identity document(s), written willingness and alternate bank-account details. One willingness declaration applies to all deposit accounts held by a depositor at that bank. The notice states a maximum of ₹5 lakh in the same capacity and same right.
- DICGC's current FAQ says willingness forms have no cut-off date while the bank remains under All-Inclusive Directions (AID) at the time of submission. This FAQ answer concerns willingness forms; it does not establish late supporting-document acceptance, inclusion in the current claim list or payment on 19 January.
- DICGC's FAQ also explains aggregation of accounts in the same capacity and right, inclusion of principal and interest in the ₹5 lakh cover, and set-off of bank dues. No individual depositor's eligibility or admissible amount is inferred.
- RBI's bank-specific direction took effect at close of business on 21 October 2026, permits withdrawals up to ₹5,000 per depositor and allows loan set-off subject to the direction. RBI states the directions run for six months, subject to review. This is separate from DICGC's deposit-insurance payment.
- DICGC's claim-willingness portal states final payment follows the bank's KYC verification under the claim-settlement procedure.

The prior `_0.pdf` URL on the public page also resolves to the same two-page notice when followed from the page. The data now uses the canonical PDF URL linked by DICGC's current press-release register; this is a source-link canonicalization, not a claim that the earlier URL was dead.

## Exact primary sources

1. DICGC official press-release register: https://www.dicgc.org.in/information-corner/press-release
2. DICGC bank-specific PDF: https://dicgc.org.in/sites/default/files/2026-10/4b-press-release-english-and-hindi-puducherry-co-operative-urban-bank-ltd-puducherry-tamil-nadu.pdf
3. DICGC FAQs: https://www.dicgc.org.in/FAQs
4. DICGC claim-willingness portal: https://www.dicgc.org.in/claim_willingness_form
5. RBI bank-specific direction: https://www.rbi.org.in/scripts/FS_PressRelease.aspx?fn=2755&prid=63840

## Repository and release provenance

- Exact pre-edit main SHA: `d8bf7e9e75a70be36bed781d434cb5332ebcac03`
- Content rollback branch created from that SHA: `backup/pre-puducherry-dicgc-correction-20261127-1819`
- Content feature branch: `research-watch/puducherry-dicgc-source-correction-20261127-1819`
- Content PR: [#206](https://github.com/aqdas1820/credonomics-site/pull/206) — merged
- Content commit on feature branch: `c583574d426e0ffcea99f6e690df50be9abf3ded`
- Merge commit and current main SHA at content release: `715bbaf155336516ef50670bc7e1447a084ef9df`
- Preview deployment: `dpl_9tWT4JqZgJGFGR3MjYpFRv9rj6MT` — READY; Vercel check passed.
- Production deployment: `dpl_8EcS3Tjo2BuWAiRU2LWfQe5J3Jcu` — READY; deployed commit matches main; Vercel listed `credonomics.in` and `www.credonomics.in` as production aliases.
- Only `app/data/research-watch.ts` changed in the content PR. The existing data-driven patterns feed the article, homepage Research Watch section, Research Watch hub, November bulletin, search index and sitemap. No separate card/fund page or navigation change applies to this bank-deposit item.

## Build verification

The Vercel preview and production builds ran the repository's existing `prebuild` sequence:

- Unit tests: **177 passed across 29 test files**
- TypeScript: `tsc --noEmit --pretty false` completed and the Next.js build proceeded.
- IPO dashboard generation: 41 records
- Search-index generation: 158 entries
- Static page generation: 364/364
- Production build: completed and deployment reached READY

Existing non-blocking Autoprefixer CSS, React Hook dependency, image-element and webpack cache-serialization warnings remain. No payment, authentication, customer/financial record, infrastructure, secret, paid-resource, ranking formula or reward valuation was changed.

## Public verification and limitation

At the post-deployment public check, the canonical article route still returned the earlier public snapshot: old title, `Checked 2026-11-15`, old summary and the prior `_0.pdf` source URL. The Research Watch hub and November bulletin also continued to show the old Puducherry card summary. The public `/search?q=Puducherry` and `/sitemap.xml` checks returned Internal Error.

The corrected GitHub main data and READY Vercel deployment are confirmed, but public content propagation is **not confirmed**. Do not describe the correction as publicly live until the article, hub and bulletin show the 27 November check and corrected FAQ qualification. The corrected official PDF and DICGC FAQ themselves were accessible and verified.

No cache purge, DNS change, alias reassignment, routing, middleware or other infrastructure change was attempted. Public delivery remains a follow-up blocker.

## Automation and scope safeguards

- Research Watch task `6adc4a968f4881919162894e39d400bc` remains disabled in its saved record; last recorded run was 29 October 2026.
- The separate daily 10 AM Research task was already disabled in its saved record; no schedule was changed.
- The publishing automation remains unchanged.
- No external messages or comments were sent.
- No payment, authentication, customer/financial record, infrastructure, secret, paid resource, card/fund ranking formula or reward valuation was changed.
