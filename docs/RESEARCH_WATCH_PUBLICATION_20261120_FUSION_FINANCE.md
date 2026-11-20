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

Pending: reviewed PR, Vercel preview build, unit tests, TypeScript, production build, production merge/deployment, public route verification and exact production commit evidence.
