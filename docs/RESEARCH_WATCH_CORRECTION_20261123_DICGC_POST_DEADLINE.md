# Research Watch Correction — DICGC 22 November Notice Date

- Review date: 23 November 2026
- Affected audience: Depositors of Tiruvalla Urban Co-operative Bank Ltd. (Pathanamthitta, Kerala) and Sri Mahatma Basaveshwar Co-operative Bank Ltd. (Afzalpur, Karnataka)
- Original publication date: 15 November 2026
- Original notice date: 9 October 2026
- Date printed in both DICGC notices: 22 November 2026
- Payment date printed in both notices: 6 January 2027, conditional
- Latest editorial check: 23 November 2026

## Editorial decision

This is a material status correction to an existing DICGC guide, not a new payment announcement. The 22 November date printed in both bank-specific notices has passed. DICGC's current FAQ says willingness forms may be submitted at any time while the bank remains under All-Inclusive Directions (AID) at the time of submission.

The FAQ is specifically about willingness forms. It is not a blanket extension of every supporting-document deadline or the bank's claim-list submission timetable. It does not guarantee inclusion in the current claim list or payment on 6 January.

The latest published DICGC Banks Under AID list is dated 14 October 2026 and includes both banks. RBI's 8 October directions state a six-month period from close of business on 8 October, subject to review. Depositors must confirm with the bank that it remains under AID when submitting.

## Primary-source verification

1. Tiruvalla DICGC payment notice, dated 9 October 2026. Its English version lists 22 November 2026 for claim/willingness submission and 6 January 2027 for payment, subject to the bank submitting the claim list and DICGC verification. The notice specifies officially valid identity documents, written willingness, alternate bank details and the ₹5 lakh ceiling in the same capacity and same right.
   - https://dicgc.org.in/sites/default/files/2026-10/5b-press-release-english-and-hindi-the-tiruvalla-urban-co-operative-bank-ltd-tiruvalla-pathanamthitta_0.pdf

2. Afzalpur DICGC payment notice, dated 9 October 2026, with the same printed dates and conditions.
   - https://dicgc.org.in/sites/default/files/2026-10/4b-press-release-english-and-hindi-sri-mahatma-basaveshwar-co-operative-bank-ltd-afzalpur_0.pdf

3. DICGC FAQ, question “Is there any cut-off date for submission of willingness forms by depositors?” The answer says depositors may submit willingness forms to the bank at any time for onward submission to DICGC, provided the bank is under AID when the form is submitted. Checked 23 November 2026.
   - https://www.dicgc.org.in/FAQs

4. DICGC Banks Under AID list, last updated 14 October 2026; both banks appear on the list.
   - https://www.dicgc.org.in/banks-under-aid

5. RBI directions for Tiruvalla, dated 8 October 2026; directions run for six months from close of business on 8 October, subject to review.
   - https://www.rbi.org.in/scripts/FS_PressRelease.aspx?fn=2755&prid=63763

6. RBI directions for Afzalpur, dated 8 October 2026; directions run for six months from close of business on 8 October, subject to review.
   - https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=63764

7. DICGC press-release register checked 23 November 2026. It still lists the 9 October notices for these two banks; no later bank-specific extension or replacement notice was found.
   - https://www.dicgc.org.in/information-corner/press-release

## Website change

Updated the existing data-driven item in `app/data/research-watch.ts`:

- Title now states that the 22 November notice date has passed and willingness forms may still be submitted conditionally under AID.
- Summary, update note, facts, actions and limitations distinguish the passed notice date from the FAQ's no-cut-off rule for willingness forms.
- `announcementDate` remains 9 October 2026; `eventDate` remains 22 November 2026; `checkedAt` is 23 November 2026; original `publishedAt` remains 15 November 2026.
- Global Research Watch check date advanced to 23 November 2026.
- Existing data-driven patterns supply the article, Research Watch hub, homepage and November bulletin. The production build regenerates the search index and sitemap; no card/fund record or ranking formula was changed.

## Practical guidance published

- Depositors who have not submitted should contact the bank's CEO/administrator promptly, confirm that the bank remains under AID, ask how to submit the signed willingness form and supporting documents, and keep a dated acknowledgement.
- Ask the bank whether a late willingness form and supporting documents can still be included in the claim list sent to DICGC.
- Depositors who already submitted should retain their acknowledgement and ask the bank whether their claim details are included in the list sent to DICGC.
- No individual eligibility, current claim-list inclusion or payment is inferred or guaranteed.

## GitHub and rollback

- Exact pre-edit main SHA: `8d4a862887e6db028b2d8f56fc91062cc936e80c`
- Feature branch: `editorial/dicgc-post-deadline-20261123-0424`
- Content PR: #150 — https://github.com/aqdas1820/credonomics-site/pull/150
- Content merge commit / final content SHA: `70738acaf08dcce1a8d6728f11a89f346c8808b5`
- Rollback reference: `backup/pre-dicgc-post-deadline-20261123-0424`
- Rollback branch: https://github.com/aqdas1820/credonomics-site/tree/backup/pre-dicgc-post-deadline-20261123-0424

## Build validation

Preview deployment:
- ID: `dpl_CnD5kGd33j6Gu7AjVtx5jBPCM28Q`
- Commit: `cc3489362e1c42acea43e7e31e06bc8d3649da6f`
- Status: READY
- Unit tests: 177 passed across 29 test files
- TypeScript: passed
- Search index: 141 entries generated
- IPO dashboard: 41 records generated
- Next.js production build: compiled successfully; 344 static pages generated
- Existing non-blocking CSS/Autoprefixer, React Hook, image and edge-runtime warnings remained.

Production deployment:
- ID: `dpl_HaofhhWYcLtWUA8hbKVEuHbPm2pv`
- Status: READY
- Deployed commit: `70738acaf08dcce1a8d6728f11a89f346c8808b5`
- Vercel reports both custom-domain aliases assigned: `www.credonomics.in` and `credonomics.in`.

## Public verification limitation

At the last public-domain check after the READY deployment:

- The individual DICGC article still rendered its previous title, 22 November check date and previous update text.
- Research Watch hub, November bulletin and homepage still displayed the 22 November global check snapshot.
- Public search and sitemap XML fetches returned Internal Error.
- Cache-busting query checks and the deployment's .vercel.app URL were not accessible through the public checker.

Therefore the content is merged and the production deployment is READY, but the updated article and generated public pages are **not confirmed publicly live**. No DNS, cache, routing or infrastructure changes were attempted. The public-rendering discrepancy remains open and must not be represented as a successful public verification.

## Safeguards and automation

- No payments, authentication, customer/financial records, infrastructure, secrets, paid resources, card/fund records, ranking formulas or reward valuations were changed.
- No external messages or comments were sent.
- No automation schedules were changed.
- Research Watch task `6adc4a968f4881919162894e39d400bc` was already disabled; latest recorded completed run was 29 October 2026.
- Daily 10 AM CredoNomics Daily Research task was already disabled; latest recorded run was 8 November 2026. It was not re-enabled or rescheduled.
