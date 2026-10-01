# CredoNomics Architecture Map

## Market Data Flow
Provider (Upstox) → Normalization (`src/providers/market/upstox-transform.ts`) → Domain (`src/domain/market/`) → `MarketDataService` → API / UI Server Components.

## Research Flow
Market Data + Company Data → `ChangeIntelligenceService`, `SectorIntelligenceService`, `ResultsIntelligenceService`, `CorporateActionScanner`, `OwnershipScannerService` → UI (`/research`, `/compare`, `/screener`)

## Mutual Funds Flow
Public JSON Ingestion (`src/services/server/public-json.ts`) → Canonical Identity Parsing → `MutualFundIntelligenceService` → Portfolio Overlap Engine → UI

## Portfolio Flow
`CSVImportAdapter` (Normalization) → `PortfolioService` → `HoldingsEngine` / `PortfolioAnalytics` / `PerformanceEngine` → Domain integration with Research / Events → UI

## Events Flow
Source JSON → Normalized schema → `CorporateActionScanner`, `ResultsIntelligenceService` → Portfolio integration / UI Calendar

## Domain Boundaries
- Market Data is strictly isolated behind `MarketDataService` and `UpstoxProvider`.
- UI should never call `upstox-client` directly.
- Cache semantics are dictated by the domain (`freshness.ts`).
