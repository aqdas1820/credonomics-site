# Research Watch release evidence — HDFC H-SIF Hybrid Long-Short NFO

## Editorial decision

Added a new, source-verified consumer guide for HDFC Mutual Fund's H-SIF Hybrid Long-Short Fund NFO. The NFO is listed as open from **13 November 2026 through 27 November 2026**. Verification date: **26 November 2026**. The KIM is dated **28 October 2026**.

The article is neutral product information, not an investment recommendation. It prominently distinguishes the ₹10 lakh aggregate SIF threshold for ordinary investors from accredited-investor treatment, the ₹5,000 additional-purchase minimum and SIP instalment amounts. It also explains the interval redemption schedule, notice period, exit load and derivative risks.

## Public article and surfaces

- Canonical route: https://www.credonomics.in/research/watch/hdfc-hsif-hybrid-long-short-nfo-november-2026
- Research Watch hub: https://www.credonomics.in/research/watch
- November bulletin: https://www.credonomics.in/updates/2026-11
- Homepage: https://www.credonomics.in/
- Mutual Fund Intelligence page: https://www.credonomics.in/mutual-funds

The article is data-driven through `app/data/research-watch.ts`. The homepage, Research Watch hub, November bulletin and Mutual Fund Intelligence page use the shared `ResearchWatchBrief` component; the mutual-fund page selects the `Mutual funds` category. The build-time search-index generator reads Research Watch data, and `app/sitemap.ts` adds every Research Watch slug. Existing navigation already links to Research Watch. No separate H-SIF fund profile exists in the CredoNomics mutual-fund portfolio workflow, so no product database, ranking or card/fund valuation was invented or changed.

## Primary-source verification

1. HDFC H-SIF ISID: https://hsif-files.hdfcfund.com/s3fs-public/2026-11/H-SIF%20Hybrid%20Long-Short%20Fund_ISID.pdf
2. HDFC H-SIF KIM dated 28 October 2026: https://hsif-files.hdfcfund.com/s3fs-public/2026-11/H-SIF%20Hybrid%20Long-Short%20Fund%20KIM%20with%20App%20Form_1.pdf
3. Current HDFC product page: https://hsif.hdfcfund.com/funds/h-sif-hybrid-long-short-fund
4. HDFC November 2026 NFO presentation: https://hsif-files.hdfcfund.com/s3fs-public/2026-11/NFO%20Presentation%20-%20H-SIF%20Hybrid%20Long-Short%20Fund%20-%20November%202026.pdf
5. HDFC H-SIF mandatory disclosures: https://hsif.hdfcfund.com/mandatory-disclosures

Verified terms and limits:

- NFO dates are 13–27 November 2026 in the KIM, ISID, NFO presentation and current HDFC product page. No extension/addendum was found in the current issuer material checked.
- The strategy is interval-based: subscriptions on business days; redemptions twice weekly (Monday/Wednesday), shifted to the next business day if needed. The KIM allows a notice period of up to 15 days and states valid redemption proceeds are dispatched within three working days after receipt at the official acceptance points.
- Non-accredited investors must meet the ₹10 lakh aggregate threshold across H-SIF strategies at PAN and holding-pattern level; ordinary HDFC mutual-fund scheme investments do not count toward this threshold. The KIM lists ₹10,000 as the accredited-investor minimum.
- The ₹5,000 additional-purchase minimum and SIP instalment minimums do not replace the overall threshold.
- Exit load is 0.50% on the applicable NAV for redemption/switch-out on or before 90 days from allotment, nil after 90 days.
- The NFO risk band is 2, but the ISID says the label may change after actual investments. Unhedged short exposure may reach 25% of net assets; the documents warn of derivative, market, liquidity and capital-loss risks.
- The KIM and ISID state that continuous sale and repurchase will reopen within five working days after allotment; neither offer document gives a fixed calendar re-opening date. The article advises checking the issuer page after allotment for the actual dealing date.
- The KIM states the units have not been approved or recommended by SEBI; no return or investment-objective assurance is claimed.

## Git and rollback evidence

- Exact pre-edit main SHA: `62c789ef398bffe0daa0596d9753a9cbed8c5e89`
- Rollback branch created at that exact SHA: `backup/pre-hsif-nfo-20261126-1324`
- Feature branch: `research-watch/hdfc-hsif-nfo-20261126-1324`
- Content-data commit on feature branch: `7d41fc63c33218151066f3e6dd13107f0b81006b`

## Build and deployment evidence

- Preview deployment, PR, merge commit, production deployment ID, READY state, deployed commit, tests, TypeScript and production-build results will be appended after the reviewed merge and deployment verification.
- The repository `prebuild` script runs `npm test`, `npm run typecheck`, the IPO and search-index generators, then the production build. These checks must pass on the preview and production builds before publication is reported as live.

## Scope and safeguards

Only the Research Watch data record and this release-evidence document are in scope. No card rankings, reward valuations, product eligibility formulas, payment flows, authentication, customer/financial records, infrastructure, secrets or paid resources are changed. No external messages or comments are sent. Automation schedules and task statuses are unchanged.
