# Research Watch publication — RBI penalty on Fusion Finance — 20 November 2026

## Status

Editorial content prepared on a feature branch. Production release evidence will be appended after validation and deployment.

- Repository: `aqdas1820/credonomics-site`
- Exact pre-edit `main` SHA: `5ab3f9e894377a087b1118c562c6570c9cf09dde`
- Rollback reference: `backup/pre-fusion-finance-rbi-penalty-20261120-2125` (created from the exact pre-edit SHA above)
- Feature branch: `editorial/fusion-finance-rbi-penalty-20261120-2125`
- Research Watch data file: `app/data/research-watch.ts`
- New article slug: `rbi-fusion-finance-penalty-internal-ombudsman-november-2026`

## Primary-source verification

Checked: **20 November 2026**.

1. RBI press release, published 20 November 2026:  
   https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=64015

   RBI reports an order dated 17 November 2026 imposing a ₹7.50 lakh penalty on Fusion Finance Limited for non-compliance with KYC and Internal Ombudsman directions. The inspection referred to the company’s financial position as at 31 March 2026. RBI identifies two sustained findings: failure to obtain PAN/equivalent e-document/Form 60 while establishing account-based relationships, and failure to escalate partly or wholly rejected complaints to the Internal Ombudsman within the prescribed time. RBI expressly says the action does not pronounce upon the validity of any customer transaction or agreement.

2. RBI, Non-Banking Financial Companies – Internal Ombudsman Directions, 2026, issued 14 January 2026:  
   https://www.rbi.org.in/ScriptS/BS_ViewMasDirections.aspx?id=13274

   The Directions require auto-escalation of partly resolved or wholly rejected complaints. For ordinary complaints, escalation is within 20 days of receipt; for complaints governed by RBI/NPCI/card-network resolution timelines, the NBFC must allow the Internal Ombudsman at least 10 days for review. The final decision must be communicated within 30 days of receipt, subject to applicable specific timelines. The Internal Ombudsman does not accept direct customer complaints. After IO review, the NBFC must advise the RBI Ombudsman option for covered complaints and provide the RBI CMS URL. The Directions include applicability criteria and complaint-category exclusions.

3. Fusion Finance, current customer-grievance page:  
   https://fusionfin.com/customer-grievance/

   The current page lists the customer-care email customercare@fusionfin.com. It displays inconsistent toll-free number renderings, so the article links to the official page and does not reproduce a phone number.

4. RBI Complaint Management System:  
   https://cms.rbi.org.in

## Editorial treatment

- Announcement date: 20 November 2026.
- Penalty order date: 17 November 2026.
- Inspection reference date: 31 March 2026.
- No separate customer-level effective date for the penalty is stated.
- Affected audience: Fusion Finance customers, particularly microfinance/MSME borrowers with partly resolved or wholly rejected complaints, and customers entering new account-based relationships.
- The guide explains the internal-ombudsman review path and directs customers to the company’s published grievance channel; it does not suggest contacting the Internal Ombudsman directly.
- The article explicitly states that the RBI penalty does not invalidate customer agreements, grant automatic compensation/refund, cancel loans, reverse dues or reopen individual complaints. It does not direct every existing customer to re-submit KYC.
- No customer count or affected account list was disclosed by RBI.
- No lending rate, fee, repayment rule, normalized product record or card-ranking formula was changed.

## Deduplication and integration

- The current Research Watch data file was checked for Fusion Finance; no existing Fusion Finance item was present.
- Current public Research Watch hub, November bulletin and homepage were inspected before editing. No Fusion Finance article or matching bulletin item was found.
- The 24 October initial batch (IDFC IndiGo, Amex November changes, HDFC Balanced Advantage and Children’s Fund exit windows, Tata Neu HDFC manual claims and SBM ZET fees) was re-read in the current data and relevant official-source pages. Existing product-specific exceptions and HOLD items were retained.
- The current main branch already covers the RBI 20 November government-security auction, NPCI UPI dispute routing, HDFC Flipkart Wholesale migration, Axis Select offer conditions, Jana retail FD/RD rates and Google Pay Flex SBI Pay in EMI. No duplicate was created for those items.
- The Indian Bank 3–5 crore bulk-deposit page now shows a 20 November status date, but the listed callable/non-callable rates match the existing 17 November coverage; this is not a new rate movement and remains outside the retail-under-₹3-crore schedule.
- The RBI 20 November press-release list was checked. Routine liquidity operations and the T-bill auction notice were not treated as new consumer-rule changes. The Fusion Finance penalty was selected because the official order identifies a customer-complaint escalation failure and a KYC control deficiency.

The existing `researchWatch` data source drives the article route, Research Watch hub, homepage brief, November bulletin, search-index generator and sitemap. No card/fund detail page exists for this NBFC penalty, so no product detail page was fabricated.

## Safeguards

Editorial content only. Payments, authentication, customer/financial records, infrastructure, secrets, paid resources, automation schedules and the separate daily 10 AM research-report task were not changed. No external messages or comments were sent.

## Release verification

**Production publication completed and independently verified.**

- Content PR: [#138](https://github.com/aqdas1820/credonomics-site/pull/138) — merged 20 November 2026.
- Content merge / production commit: `a6fe88c91bf8b9d3f2b190ed83477e3eca0abc1b`.
- Production Vercel deployment: `dpl_A5vb5y9dHX5CrZWVbV8MmmBhAx1j` — **READY**.
- Production deployment URL: https://vercel.com/aqdasshaikh1820-9566s-projects/credonomics-site/A5vb5y9dHX5CrZWVbV8MmmBhAx1j
- Preview deployment for the reviewed final PR head: `dpl_AgVGMaNPGo1TfSuHqj5sk9zMwdR5` — **READY**; the preview article and integration routes were checked before merge.
- Unit tests: **177 passed across 29 test files**.
- TypeScript: `tsc --noEmit --pretty false` completed successfully.
- Production build: Next.js build completed successfully; existing CSS autoprefixer and lint warnings were non-blocking and unrelated to the editorial data change.
- Build-time search-index generator: **139 entries**.
- Static pages generated: **342**.

### Production URL checks

Direct production-domain fetches returned **HTTP 200** for each route below. The article body included the RBI penalty amount, Fusion grievance email, express limitation on customer transaction/agreement validity and both full RBI source URLs.

- Article: https://www.credonomics.in/research/watch/rbi-fusion-finance-penalty-internal-ombudsman-november-2026
- Research Watch hub: https://www.credonomics.in/research/watch
- November bulletin: https://www.credonomics.in/updates/2026-11
- Homepage: https://www.credonomics.in/
- Search page: https://www.credonomics.in/search?q=Fusion%20Finance
- Sitemap: https://www.credonomics.in/sitemap.xml — contains the exact article URL.

The Research Watch hub, November bulletin and homepage contain the new article title. The search-index generator ran successfully and the public search route returned HTTP 200. The generated search index is a build-time TypeScript artifact, not a separately exposed public JSON file; no claim is made that a standalone index URL was fetched.

### Source-link verification

The article’s full official source links were opened and checked:

- RBI penalty release: https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=64015
- RBI NBFC Internal Ombudsman Directions, 2026: https://www.rbi.org.in/ScriptS/BS_ViewMasDirections.aspx?id=13274
- Fusion Finance current customer-grievance page: https://fusionfin.com/customer-grievance/
- RBI Complaint Management System: https://cms.rbi.org.in

The Fusion grievance page displays two different toll-free number formats in different page areas. The article therefore links to the current official grievance page and does not reproduce a phone number. The verified customer-care email is `customercare@fusionfin.com`.

### Final repository and rollback references

- Pre-edit main SHA preserved: `5ab3f9e894377a087b1118c562c6570c9cf09dde`.
- Content rollback branch: `backup/pre-fusion-finance-rbi-penalty-20261120-2125` — points to that exact pre-edit SHA.
- Pre-evidence main SHA: `a6fe88c91bf8b9d3f2b190ed83477e3eca0abc1b`.
- Release-evidence rollback branch: `backup/pre-fusion-finance-release-evidence-20261120-2142` — created from the exact pre-evidence SHA.
- Release-evidence feature branch: `docs/fusion-finance-release-evidence-20261120-2142`.

The current release-evidence update is documentation-only. No card ranking formula, payment, authentication, customer/financial record, infrastructure, secret, paid resource or automation schedule was changed.
