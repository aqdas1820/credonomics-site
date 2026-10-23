# Route and boundary audit

Base commit: `a0ba47d10fbbf2131a8a3c2700aa96b65dce06e8`. 52 page templates; 22 API route handlers.

Next.js 14.2.35 App Router, React 18.3.1, TypeScript, CSS modules/global CSS, styled-jsx MF terminal, lucide-react; existing lightweight-charts. No new production dependencies.

Shared entry: app/layout.tsx → globals.css + midnight.css; SiteFrame → SiteHeader, SiteExperience, main, SiteFooter. MF has its own layout; quick calculators use CalculatorShell. Dynamic records retain existing generateStaticParams/data sources. Template coverage is not a claim of visual verification of every record.

| Route template | Source | Presentation coverage |
|---|---|---|
| `/about` | `app/about/page.tsx` | Shared tokens and editorial typography; legal copy retained |
| `/account` | `app/account/page.tsx` | Calm shared shell; no new motion or account logic |
| `/alerts` | `app/alerts/page.tsx` | Calm shared shell; no new motion or account logic |
| `/cards/[slug]` | `app/cards/[slug]/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/cards/all` | `app/cards/all/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/cards/analyzer` | `app/cards/analyzer/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/cards/compare` | `app/cards/compare/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/cards/coverage` | `app/cards/coverage/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/cards/issuer/[slug]` | `app/cards/issuer/[slug]/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/cards` | `app/cards/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/contact` | `app/contact/page.tsx` | Shared tokens and editorial typography; legal copy retained |
| `/corrections` | `app/corrections/page.tsx` | Shared tokens and editorial typography; legal copy retained |
| `/disclosures` | `app/disclosures/page.tsx` | Shared tokens and editorial typography; legal copy retained |
| `/discover` | `app/discover/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/[slug]` | `app/ipo/[slug]/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/analyzer` | `app/ipo/analyzer/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/calendar` | `app/ipo/calendar/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/company/[slug]` | `app/ipo/company/[slug]/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/current` | `app/ipo/current/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/documents` | `app/ipo/documents/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/mainboard` | `app/ipo/mainboard/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/methodology` | `app/ipo/methodology/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo` | `app/ipo/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/sme` | `app/ipo/sme/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/subscription` | `app/ipo/subscription/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/ipo/upcoming` | `app/ipo/upcoming/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/markets` | `app/markets/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/methodology` | `app/methodology/page.tsx` | Shared tokens and editorial typography; legal copy retained |
| `/mutual-funds` | `app/mutual-funds/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/official` | `app/official/page.tsx` | Shared tokens and editorial typography; legal copy retained |
| `/` | `app/page.tsx` | Signature SVG hero, static category links, existing financial states |
| `/privacy` | `app/privacy/page.tsx` | Shared tokens and editorial typography; legal copy retained |
| `/reports/monthly-indian-equity-opportunity-report-august-2026` | `app/reports/monthly-indian-equity-opportunity-report-august-2026/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/reports` | `app/reports/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/research/articles/[slug]` | `app/research/articles/[slug]/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/research/card-scoring` | `app/research/card-scoring/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/research/credit-card-data-standard` | `app/research/credit-card-data-standard/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/research` | `app/research/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/search` | `app/search/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/stocks/[exchange]/[symbol]` | `app/stocks/[exchange]/[symbol]/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/stocks/search` | `app/stocks/search/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/terms` | `app/terms/page.tsx` | Shared tokens and editorial typography; legal copy retained |
| `/tools/annual-fee-break-even` | `app/tools/annual-fee-break-even/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/tools/cashback-calculator` | `app/tools/cashback-calculator/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/tools/cashback-cap` | `app/tools/cashback-cap/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/tools/credit-card-finder` | `app/tools/credit-card-finder/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/tools/fuel-card-optimizer` | `app/tools/fuel-card-optimizer/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/tools/fuel-surcharge-waiver` | `app/tools/fuel-surcharge-waiver/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/tools/mf-portfolio-tracker` | `app/tools/mf-portfolio-tracker/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/tools` | `app/tools/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/tools/reward-point-value` | `app/tools/reward-point-value/page.tsx` | Shared tokens, contextual workflow accent, existing data UI |
| `/watchlist` | `app/watchlist/page.tsx` | Calm shared shell; no new motion or account logic |

## Boundaries and exceptions

- APIs, account/authentication policies, Supabase, Upstox providers, calculations, source records, SEO modules, financial data generation and payment logic are unchanged.
- Existing account/alerts/watchlist receive shell styling only; no account actions were performed.
- YouPI checkout, Gmail Observer, Merchant Admin and Cloudflare subdomains are separate applications. Their repositories were not opened or modified. Their security and payment behavior are outside this branch.
- No static HTML applications were found in public/. Existing document/PDF links and metadata are retained.
- Existing support component and its disabled-payment behavior are unchanged.
- 404 and error/loading states inherit global tokens; their recovery logic is unchanged.
- Rendered visual QA, browser contrast/zoom tests and real-user Web Vitals remain release gates until the browser environment is available.
