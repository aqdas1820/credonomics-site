# Research Watch publication record — EPFO CBT-approved withdrawal proposals

## Editorial decision

Publish a narrowly scoped status guide explaining the official 19 November 2026 announcement from the Ministry of Labour & Employment about the 240th Central Board of Trustees (EPF) meeting.

The useful consumer distinction is that the Board approved the described policy changes, but the PIB release does not give an effective date or final scheme text for the 10% minimum-balance and 2-month final-withdrawal provisions. The Systematic Withdrawal Plan is explicitly described as a proposal, with EPF Scheme amendments to be notified after Ministry approval. The article must not describe any of these facilities as currently operational.

## Dates and affected audience

- Announcement: 19 November 2026; PIB posted the release at 6:28 PM.
- Editorial check: 25 November 2026.
- Publication date: 25 November 2026.
- Effective date: not stated in the PIB release.
- Affected audience: EPF members considering withdrawals, employees approaching retirement and families reviewing retirement payout options.

## Primary-source verification

1. Ministry of Labour & Employment / Press Information Bureau, release ID 2338667:
   https://www.pib.gov.in/PressReleasePage.aspx?PRID=2338667&lang=1&reg=1

   Checked paragraphs:
   - 19 November 2026, 6:28 PM publication timestamp.
   - 240th CBT meeting and agenda.
   - Systematic Withdrawal Plan proposal for retiring EPF members.
   - Board-approved reduction of minimum balance from 25% to 10%.
   - Board-approved reduction of final-withdrawal waiting period from 12 months to 2 months.
   - Statement that the necessary EPF Scheme amendments for SWP will be notified after Ministry approval.

2. Official EPFO portal for later implementation notices:
   https://www.epfindia.gov.in/

3. Official eGazette portal checked for an implementing EPF Scheme amendment:
   https://egazette.gov.in/

No implementing Gazette notification or EPFO launch instruction was identified in this check. This is a source-check limitation, not a claim that no later notification can be issued.

## Verified facts and limitations

- PIB confirms the Board-approved 10% minimum-balance and 2-month final-withdrawal waiting-period changes as announced on 19 November.
- PIB describes SWP as a proposal for voluntary periodic payouts (monthly, quarterly or half-yearly) to retiring EPF members.
- PIB says the remaining corpus would continue generating returns under the proposed SWP and describes possible nominee/dependent treatment, but detailed rules are not supplied.
- The PIB release does not state an effective date for the minimum-balance or waiting-period changes.
- For SWP, PIB says the necessary EPF Scheme amendments will be notified after Ministry approval.
- Eligibility, claim process, payout formula, tax treatment, pending-claim treatment and commencement date remain unverified.
- The article expressly says members must continue following current EPFO claim rules until formal implementation. No new withdrawal entitlement or guaranteed payout is asserted.

## Website implementation

- Add one WatchItem to app/data/research-watch.ts using the existing data-driven article route.
- Article slug: epfo-cbt-approves-proposed-withdrawal-changes-not-yet-effective-november-2026.
- Category: Pensions.
- Status: Implementation date unconfirmed.
- Announcement date: 19 November 2026.
- Checked/publication date: 25 November 2026.
- Effective date: not stated.
- Existing article route, Research Watch hub, homepage brief, November bulletin, search-index generator and sitemap consume the Research Watch data. No separate navigation change is required.
- No pension, card, fund or investment-ranking formula is changed.

## Repository and rollback

- Repository: aqdas1820/credonomics-site
- Exact pre-edit main SHA: b7bfa3f1a5b7a9bb122839a1b259febf7d8955fa
- Rollback branch: backup/pre-epfo-cbt-20261125-0149
- Feature branch: editorial/epfo-cbt-20261125-0149

## Release evidence

### Content PR and merge

- Content PR: https://github.com/aqdas1820/credonomics-site/pull/171
- Reviewed head SHA: ec847bf7da1216d09a606a100b0c41b7f2722a20
- Content merge commit: d48dce8657b44c2f39f84e27021798ec3678eee5
- Exact pre-edit main SHA: b7bfa3f1a5b7a9bb122839a1b259febf7d8955fa
- Rollback reference: https://github.com/aqdas1820/credonomics-site/tree/backup/pre-epfo-cbt-20261125-0149

### Build and validation

- Vercel preview deployment: dpl_FBpgLH1vXxrFmCAyJuPgLAKHPTcg — READY for the reviewed PR head ec847bf7da1216d09a606a100b0c41b7f2722a20.
- Production deployment for content merge: dpl_5eNqXx4JgGEErvu5gZG3LTjV5R4B — READY; deployed commit d48dce8657b44c2f39f84e27021798ec3678eee5 matches main.
- Existing prebuild ran 29 test files / 177 tests: all passed.
- TypeScript check: passed.
- Search-index generation: 149 entries.
- IPO dashboard generation: 41 records.
- Next.js production build: completed; 353 static pages generated.
- Existing non-blocking CSS/autoprefixer, React Hook and image-optimization warnings remain; no new warning was treated as a release blocker.

### Public verification and blocker

- Official PIB source: accessible and checked at https://www.pib.gov.in/PressReleasePage.aspx?PRID=2338667&lang=1&reg=1.
- Research Watch hub: HTTP 200, but its public snapshot still says latest publication/check 24 November 2026 and does not show the EPFO entry.
- November bulletin: HTTP 200, but its public snapshot still says latest check 24 November 2026 and does not show the EPFO entry.
- Homepage: HTTP 200, but its Research Watch section still shows the 24 November snapshot and does not show the EPFO entry.
- Individual EPFO article URL returned Internal Error to the independent public checker.
- Sitemap endpoint returned Internal Error to the independent public checker.
- Vercel reports production READY and the custom-domain aliases assigned, but those facts do not establish public rendering. The article is therefore NOT marked publicly live/verified.
- No DNS, cache-purge, routing, infrastructure or paid-resource changes were attempted.

### Release decision

The source-backed article is merged and deployed, with the explicit not-yet-in-force caveat. Public rendering remains unverified because the public checker shows stale hub/bulletin/homepage snapshots and cannot fetch the article or sitemap. Keep the publication evidence open for a later public verification; do not infer that the content is live solely from the READY deployment.

## Safeguards

No payments, authentication, customer/financial records, infrastructure, secrets or paid resources are changed. No card/fund ranking formula or financial-service workflow is changed. No external messages or comments are sent. No automation schedules are changed.