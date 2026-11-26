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

Verified terms and limits:

- NFO dates are 13–27 November 2026 in the KIM, ISID, NFO presentation and current HDFC product page. The KIM says any modification to the NFO period must be announced by addendum on the H-SIF webpage. No revised date was visible on the current product page or in the checked offer documents; the separate statutory-disclosures page could not be retrieved, so no broader claim about every possible addendum is made.
- The strategy is interval-based: the ISID lists daily subscription frequency; redemptions are twice weekly (Monday/Wednesday), shifted to the next business day if needed. The KIM allows a notice period of up to 15 days and states valid redemption proceeds are dispatched within three working days after receipt at the official acceptance points.
- Non-accredited investors must meet the ₹10 lakh aggregate threshold across H-SIF strategies at PAN and holding-pattern level; ordinary HDFC mutual-fund scheme investments do not count toward this threshold. The KIM lists ₹10,000 as the accredited-investor minimum. SIP registration is for an existing investor who continues to meet the threshold. SWP withdrawals and STP transfer-out instalments must leave at least ₹10 lakh; if market movements passively take aggregate SIF value below the threshold, the KIM says only the entire remaining SIF investment may be redeemed.
- The ₹5,000 additional-purchase minimum and SIP instalment minimums do not replace the overall threshold.
- Exit load is 0.50% on the applicable NAV for redemption/switch-out on or before 90 days from allotment, nil after 90 days.
- The NFO risk band is 2, but the ISID says the label may change after actual investments. Unhedged short exposure may reach 25% of net assets; the documents warn of derivative, market, liquidity and capital-loss risks.
- The KIM and ISID state that continuous sale and repurchase will reopen within five working days after allotment; neither offer document gives a fixed calendar re-opening date. The article advises checking the issuer page after allotment for the actual dealing date.
- The KIM states the units have not been approved or recommended by SEBI; no return or investment-objective assurance is claimed.

## Git and rollback evidence

- Exact pre-edit main SHA: `62c789ef398bffe0daa0596d9753a9cbed8c5e89`
- Rollback branch created at that exact SHA: `backup/pre-hsif-nfo-20261126-1324`
- Content feature branch: `research-watch/hdfc-hsif-nfo-20261126-1324`
- Initial content-data commit: `7d41fc63c33218151066f3e6dd13107f0b81006b`
- Final reviewed feature-branch head: `faf4eab66ea50bbbc4b0ccba61977207c2c1d29a`
- Content PR: [#189](https://github.com/aqdas1820/credonomics-site/pull/189), merged by squash.
- Production merge commit: `a9664587aface69c835302ab060c8b8f655fde20`

## Build and deployment evidence

- Preview deployment: `dpl_88DA3bhqC5aD2mBerw4jvUGR5qHh` — READY for the reviewed feature-branch head. The preview URL could not be fetched by the external page checker, so preview-page visibility was not claimed.
- Production deployment: `dpl_FdXGDCtwYg2XTjaeoWJaWjS916pe` — READY, target `production`, deployed commit exactly matches `a9664587aface69c835302ab060c8b8f655fde20`.
- Vercel assigned both `credonomics.in` and `www.credonomics.in` aliases to the deployment.
- Unit tests: **177/177 passed across 29 test files**.
- TypeScript: **passed**.
- IPO dashboard generator: **41 records**.
- Search-index generator: **151 entries** (one more than the prior 150-entry index).
- Next.js production build: **completed**, generating **354 static pages**. Build output explicitly included `/research/watch/hdfc-hsif-hybrid-long-short-nfo-november-2026`, `/research/watch`, `/updates/2026-11`, `/mutual-funds`, `/search` and `/sitemap.xml`.
- Existing non-blocking CSS Autoprefixer, React Hook and image-optimization warnings remained; no build failure was reported.

## Public visibility verification — unresolved

The deployment is READY and the article route is present in the build output, but public visibility was **not independently confirmed** at the time of release verification:

- The canonical article URL, `https://www.credonomics.in/research/watch/hdfc-hsif-hybrid-long-short-nfo-november-2026`, returned Internal Error through the public page checker. The deployment-specific Vercel URL returned the same checker error.
- The public Research Watch hub and November bulletin were accessible, but their rendered snapshots did not contain the H-SIF article; the hub still led with the SEBI KRA update.
- The public homepage was accessible but did not show the H-SIF article in its rendered Research Watch section.
- The Mutual Fund Intelligence page returned a cached snapshot last crawled the prior week, with its Research Watch section still dated 13 November and no H-SIF entry.
- Public `/sitemap.xml` and `/search?q=H-SIF` requests returned Internal Error. The build did generate both routes and the 151-entry search index.
- A direct container HTTP check could not resolve `www.credonomics.in` because the execution environment's DNS lookup failed; this is an environment limitation, not proof of a public-site outage.

The article and source data are in GitHub main and the route was statically generated, but this release record does **not** assert that the article is publicly live. No cache purge, DNS, routing, middleware, Vercel configuration or other infrastructure changes were attempted. Recheck the canonical route, hub, bulletin, homepage, mutual-funds page, search and sitemap before treating public visibility as resolved.

## Scope and safeguards

Only the Research Watch data record and this release-evidence document are in scope. No card rankings, reward valuations, product eligibility formulas, payment flows, authentication, customer/financial records, infrastructure, secrets or paid resources are changed. No external messages or comments are sent. Automation schedules and task statuses are unchanged.
