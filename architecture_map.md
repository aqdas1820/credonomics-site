# CredoNomics V2 Internal Architecture Map

## Overview
CredoNomics is a Next.js (App Router) based financial intelligence platform. It is statically generated where possible for performance, mixed with dynamic server-side logic for personalization (Auth) and live market data.

## Core Stack
- **Framework:** Next.js (React)
- **Deployment:** Vercel (Edge & Node runtimes)
- **Database / Auth:** Supabase (PostgreSQL, Row Level Security)
- **Styling:** CSS Modules (`globals.css`, `core-v4.module.css`, `site-v3.module.css`)
- **Third-Party Integrations:**
  - Upstox (Market Data & IPO feeds)
  - Resend (Newsletter)
  - Sentry (Observability/Error Tracking)
  - Stripe (Monetization - Currently deferred/disabled)

## Directory Structure
- `app/` - Next.js App Router (Pages, API routes, layout, SEO)
  - `api/` - Backend API endpoints (e.g., `/api/ipos`, `/api/newsletter`, `/api/stocks/*`, `/api/alerts`)
  - `auth/` - Supabase Auth flow (e.g. `callback`)
  - `stocks/`, `ipo/`, `mutual-funds/`, `cards/` - Core financial domains
  - `tools/`, `research/`, `markets/` - Aggregated research & utility hubs
  - `account/`, `dashboard/`, `watchlist/`, `alerts/` - Personalized authenticated flows
  - `data/` - Static/build-time data aggregation (e.g. IPO statics, Card Engine)
  - `components/` - Shared UI components
  - `seo/` - Canonical rules, OpenGraph meta
- `src/` - Domain Logic and Reusable Services
  - `domain/` - Types, interfaces, business logic rules (Equity, IPO, etc.)
  - `lib/` - Shared utility functions (Supabase clients, caching, formatters)
  - `schemas/` - Zod validation schemas
  - `services/` - Data fetching wrappers (Upstox integration)
- `scripts/` - Offline/Build-time generation scripts (e.g. Search Index generation, MF pipelines)
- `tests/` - Unit tests for core functions
- `public/` - Static assets

## Data Flow
- **Static Assets:** Build-time JSON generation powers search and MF tracking.
- **Dynamic Endpoints:** Upstox API serves live IPO statuses and stock quotes, merged dynamically by server components.
- **Background Tasks:** Cron jobs (e.g. `alerts/evaluate`) process thresholds and send notifications.

## Authentication & Security
- Next.js Server Components safely access Supabase via Server clients (`@supabase/ssr`).
- Row Level Security (RLS) protects watchlists and alerts in PostgreSQL.
- API keys (Upstox, Resend) are never exposed client-side.

## Next Steps: V2 Target
Extend the existing central platform; do not introduce a parallel provider architecture.

## V2 continuation inspection — 2026-09-29
- Stock API routes call `src/services/market-data/market-data-service.ts`, which exposes the existing `MarketDataProvider` interface. `UpstoxMarketDataProvider` uses the shared server-only `src/lib/upstox/client.ts` transport. Instrument search/resolution belongs to `instrument-master.ts`; quote and candle validation already exist.
- Existing `FinancialDataMetadata` carries source, asOf, generatedAt, quality and availability. Preserve this contract while adding missing provenance. Fetch time is not a substitute for the provider's observation date.
- Stock pages already have quotes, charts, fundamentals, financial intelligence and corporate-action endpoints. Provider methods for financial statements still explicitly return NOT_SUPPORTED.
- IPO dashboard and detail pages share `app/data/ipo-live.ts`; deterministic generation runs during prebuild. Continue from the existing merge fixes instead of repeating the IPO audit.
- MF browser data is the v2 static projection, with strict ISIN ingestion and validation scripts. The production README documents stale/low-quality source coverage; fresh holdings require newly verified source disclosures.
- Search uses `scripts/generate-search-index.mjs` and the generated local index. Personalization already includes dashboard, device/cloud watchlists and alerts. Cloud evaluation uses a service-role-only atomic alert/notification RPC, with a daily Vercel cron and authenticated manual evaluation.
- Supabase server/browser/admin clients are separate. Existing migrations implement account ownership/RLS and atomic alert notification. Resend is isolated in the newsletter API; Sentry instrumentation is present. No infrastructure rebuild is needed for the transport phase.

## Prioritized continuation backlog (not claims of completed V2 phases)
1. P1: Provider hardening and stock freshness changes are now Preview-tested (see ASTRA_HANDOFF.md). Continue endpoint-specific payload validation beyond transport envelopes.
2. P1: Stock quote/candle freshness now derives from observation time; undated fundamental/shareholding/action snapshots show unknown observation time via the shared DataFreshness component. Next add explicit server/CDN cache-delivery metadata and finish IPO/market aggregate and financial-intelligence provenance. Do not replace verified missing dates with fetch time.
3. P1: Partial batch alert evaluation must distinguish missing quotes from successfully checked alerts. Confirm deployed atomic RPC before expanding alert types.
4. Stock research: normalize reliable financial statements, peer identity and event provenance; keep unsupported fields unavailable.
5. Personal dashboard: connect saved research/recent views and upcoming events to existing ownership and watchlist flows; add event identity/cooldowns before recurring alerts.
6. MF/IPO: acquire verified fresh portfolios, test overlap/weight math, extend normalized IPO lifecycle and source timestamps.
7. Research metadata/disclosures, deterministic search validation, private-page indexing, measured performance and remaining mobile flows.
8. Entitlements only when useful. Payments remain deferred; no production deployment without approval.
