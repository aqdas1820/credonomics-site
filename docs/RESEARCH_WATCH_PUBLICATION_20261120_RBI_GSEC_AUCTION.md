# Release evidence — RBI 20 November 2026 government securities auction result

## Publication

- Content PR: https://github.com/aqdas1820/credonomics-site/pull/136
- Content merge commit: 84920d7603ee8b91a4d26a853f340efcbd2d3de9
- Feature branch: editorial/rbi-gs-auction-result-20261120-1626
- Original PR base SHA at creation: a1d3e1dc25482b16215e156072a82f4c90dc097f
- Current main immediately before the content merge: d30569a1cdd5a8534542bbf58e964f54b19f9a80
- Exact pre-merge rollback reference: https://github.com/aqdas1820/credonomics-site/tree/backup/pre-rbi-gs-auction-result-20261120-1654
- Earlier pre-refresh rollback reference: https://github.com/aqdas1820/credonomics-site/tree/backup/pre-rbi-gs-auction-result-20261120-1626
- Main after publication: 84920d7603ee8b91a4d26a853f340efcbd2d3de9

The main branch advanced by one automated IPO-intelligence refresh while PR #136 was open. The editorial branch was updated to include that exact main commit before merge. A comparison against the then-current main showed only the intended files changed: app/data/research-watch.ts and package.json. The generated IPO refresh was retained.

## Consumer/investor update

- Article: https://www.credonomics.in/research/watch/rbi-retail-direct-government-bond-auction-20-november-2026
- Affected audience: individuals who submitted a non-competitive bid for 6.53% GS 2031 or 7.71% GS 2066, including RBI Retail Direct users and investors who bid through an intermediary.
- Original auction notice date: 16 November 2026.
- Result announcement date: 20 November 2026.
- Editorial check date: 20 November 2026.
- Settlement date for successful bidders: 23 November 2026.
- The auction is complete; the bidding window is closed. No future auction terms are inferred.

RBI's 20 November result (Press Release 2026-2027/1533) reports:
- 6.53% GS 2031: competitive cut-off price ₹97.66 and implicit yield 7.1116%; ₹19,000 crore accepted.
- 7.71% GS 2066: competitive cut-off price ₹98.80 and implicit yield 7.8083%; ₹14,000 crore accepted.

The original 16 November notice specifies a multiple-price auction. It says non-competitive allotment is at the weighted-average price/yield of successful competitive bids. The 20 November result publishes the competitive cut-off values but does not publish the weighted-average value used for non-competitive allotment. The guide therefore explicitly warns retail bidders not to treat the cut-off as their allotment price. Successful bidders are directed to confirm their own allotment and settlement amount through RBI Retail Direct or their intermediary. The guide does not infer any new refund entitlement or process.

## Primary sources

- RBI result announced 20 November: https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=64011
- Original RBI auction notice dated 16 November: https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=63983
- RBI Retail Direct FAQ, especially minimum amount, allotment price and non-competitive pricing: https://www.rbi.org.in/commonman/english/scripts/FAQs.aspx?Id=3337
- RBI Retail Direct portal: https://rbiretaildirect.org.in/index.html

The result, original auction notice and FAQ were independently opened and checked. The result page confirms the cut-off prices/yields and full notified amounts accepted. The original notice confirms the auction method, ₹10,000 minimum face-value bid and weighted-average pricing for non-competitive allotments. The FAQ confirms the weighted-average allotment-price rule.

## Validation

### Vercel preview

- Preview deployment: dpl_75aUwgtjNqybbGZWHDEx9Kiv8NVB
- Preview commit: 0e134410be746508bbd5068cf7088e81deb0aa3f
- Preview state: READY.
- Unit tests: 177 passed across 29 test files.
- Standalone TypeScript command: `tsc --noEmit --pretty false`; completed without errors.
- Search-index generation: 138 CredoNomics entries.
- Next.js production build: completed successfully.
- Static pages generated: 341.
- Generated routes included /research/watch, the updated auction article, /updates/2026-11, /search and /sitemap.xml.

### Production

- Production deployment: dpl_BfHvgMJaMB5F6iHhMC3gE3BfWCWo
- Deployed production commit: 84920d7603ee8b91a4d26a853f340efcbd2d3de9
- Vercel state: READY.
- Production aliases: www.credonomics.in and credonomics.in.

Direct custom-domain fetches returned HTTP 200 and confirmed the new content:
- Article route: /research/watch/rbi-retail-direct-government-bond-auction-20-november-2026
- Research Watch hub: /research/watch
- Homepage: /
- November bulletin: /updates/2026-11
- Search: /search?q=RBI%2020%20November%20bond%20auction — three results; the updated auction guide appears first.
- Sitemap: /sitemap.xml — contains the article URL.

The homepage card, Research Watch hub and November bulletin display the updated article. The article's HTML contains the RBI result link, original notice, Retail Direct FAQ and official Retail Direct portal. The initial generic web-crawler snapshot was stale, but a fresh direct fetch from the production custom domain returned the updated article with HTTP 200 and Vercel cache age 0.

## Review and deduplication

The Research Watch task 6adc4a968f4881919162894e39d400bc was already disabled; its latest recorded result was 29 October 2026. The repository's intervening publications and the current public Research Watch hub and November bulletin were reviewed. The 24 October initial batch was re-read: IDFC IndiGo international rewards, Amex November changes, HDFC Balanced Advantage and Children's Fund exit windows, Tata Neu HDFC manual NeuCoins claims, and SBM ZET fees. Existing product-specific exceptions and unresolved wording were retained. ICICI card changes and Axis complimentary-membership consent rules were already covered in the current hub and bulletin. Unresolved UTI Mutual Fund source documentation, the South Indian Bank MCLR mismatch and the SBM ZET effective date remain HOLD. No duplicate guide was added.

## Scope safeguards

- No credit-card ranking formula, reward valuation or normalized card record changed.
- No payment flow, authentication, customer/financial record, infrastructure, secret or paid resource changed.
- No automation schedule or task state changed.
- Research Watch task 6adc4a968f4881919162894e39d400bc was already disabled and was left unchanged.
- The separate daily 10 AM CredoNomics Daily Research task was already disabled when inspected and was left unchanged; it was not re-enabled or rescheduled.
- The Publish CredoNomics Research automation was left enabled and its schedule unchanged.
- No external messages or comments were sent.
