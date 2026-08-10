CREDONOMICS V11 — INDIAN CREDIT CARD DATABASE & COVERAGE ENGINE
================================================================

PUBLIC PRODUCT CHANGES
- Credit Card Intelligence becomes the homepage flagship.
- /cards shows 8 popular categories first; 8 more remain available in an expandable section.
- /cards/coverage exposes actual normalized record counts and issuer coverage.
- /cards/issuer/<slug> exposes issuer-specific coverage.
- /cards/<card-id> now has a real individual card research page.
- Category rankings link to card detail pages.
- Card detail pages link to issuer, categories, related cards and head-to-head comparisons.
- /cards/compare supports shareable real-card selections.
- Spending profiles are saved locally across card categories.
- Ranking profile links can be shared.

DATA / TRUST CHANGES
- Verified normalized data remains the only source for live financial rankings.
- Automated crawler output stays in the discovery layer.
- A generated review queue detects new-card candidates, possible fee changes and stale reviews.
- Terms-change history infrastructure is visible on every card page.
- Coverage statistics are generated from real arrays; no fake market-size counters.

SEO / DISCOVERY
- Sitemap includes category, card detail, issuer and coverage URLs.
- Card pages add BreadcrumbList + CreditCard schema.
- Category pages add ItemList schema.
- A daily production health workflow checks key live URLs and sitemap markers.

PERFORMANCE
- Category pages server-filter the card database and send only relevant cards to the client ranking component.

MF SAFETY
- app/tools/mf-portfolio-tracker/ excluded
- public/data/mf-intelligence/ excluded
- data/ excluded
- scripts/mf_* and scripts/mf-* excluded
- requirements-mf.txt excluded
- app/globals.css excluded
