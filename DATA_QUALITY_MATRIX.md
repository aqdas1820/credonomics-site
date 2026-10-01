# Data Quality Matrix

| Module | Source | Identity Method | Reporting Period | Freshness | Failure Behavior | Fallback Behavior | Coverage | Known Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Market Quotes | Upstox | ISIN/Symbol | Realtime/Daily | LIVE/DELAYED | UNAVAILABLE | Cache/Stale | High | Rate limits apply |
| Company Financials | Public JSON | ISIN/Symbol | Quarterly/Annual | CACHED | null values | Previous Period | Medium | Delayed reporting |
| Corporate Events | Public JSON | Symbol | Daily/Announced | CACHED | Ignore | None | High | Manual data entry limits |
| IPO | Public JSON | Custom Slug | Daily Updates | CACHED | Hides missing | None | Medium | Subscription data delays |
| Mutual Funds | Public JSON | Scheme Code | Monthly NAV | CACHED | UNAVAILABLE | None | Medium | Portfolios delayed |
| Sector | Internal | Sector ID | Static | STATIC | N/A | Default | Full | Fixed taxonomy |
| Peers | Internal | Sector ID | Dynamic | CACHED | Empty | None | High | |
| Screener | Computations | Screener ID | Dynamic | CACHED | Drops row | Fails closed | High | Missing data skips row |
| Results | Public JSON | ISIN/Symbol | Quarterly | CACHED | null | None | Medium | |
| Ownership | Public JSON | ISIN/Symbol | Quarterly | CACHED | null | None | Medium | |
| Portfolio | User CSV | ISIN/Symbol | Snapshot | DYNAMIC | UNAVAILABLE | Ignore | Complete (local) | No broker integration |
| Filings | Public JSON | ISIN/Symbol | Announced | CACHED | Ignore | None | High | Exchange delays |
