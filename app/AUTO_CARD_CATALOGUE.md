CREDONOMICS V9 — AUTOMATIC CREDIT CARD CATALOGUE
=================================================

WHAT HAPPENS
- The refresh script fetches only the hard-coded official issuer catalogue/product hosts.
- It extracts product names, fees, percentages and category signals.
- It generates:
    app/data/auto-card-catalog.generated.ts
    public/data/cards/auto-catalog.json
- Every /cards/<category> page automatically ranks the strongest 15 matches.
- Each row links back to the official issuer source.
- The UI labels the ranking "Auto Research Rank" because extraction can be imperfect.

AUTOMATIC REFRESH
.github/workflows/refresh-credit-card-catalog.yml
runs every Monday and Thursday and can also be run manually from GitHub Actions.

MANUAL REFRESH
node scripts/cards/refresh-card-catalog.mjs

IMPORTANT
An automated extractor can misunderstand changed page layouts or promotional language.
The site therefore shows extraction confidence and keeps the official source visible.
Never convert this automated rank into a guaranteed "best card" recommendation without review.
