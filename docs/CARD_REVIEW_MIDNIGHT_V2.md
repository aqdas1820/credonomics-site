# CredoNomics — Midnight credit-card review integration

Status: Code staged on feat/midnight-card-review-cohesion-20261101. DO NOT merge or deploy until the owner authorizes release.

## Why
The screenshot-inspired vertical card directory introduced a forced white background and light form controls into an otherwise Midnight Intelligence website. This caused a disconnected appearance and conflicted with global high-specificity dark form styling.

## Changes
- The /cards/all detailed review list, bank issuer mega-menu, search, reward categories, fee sorting, source-linked fee/reward information, expandable conditions and compare selection remain intact.
- Background, cards, borders, headings, search, selects, badge surfaces, highlight strips, CTAs, focus styles and menu use existing --cn-* Midnight Intelligence tokens.
- The global theme toggle is respected: light mode gets the same site-wide light tokens, rather than page-specific forced white styling.
- Card-artwork frames share themed --cn-surface-raised and --cn-border backgrounds.
- Mobile/tablet breakpoints and reduced-motion rules retained.

## Data and access boundaries
- No credit card financial terms, reward models, source URLs, rankings, fees, or dates modified.
- No user records, accounts, checkout or production payment flows changed.
- Do not invent ratings, welcome benefits, affiliate relationships or issuer approvals.
- This is not a production release; main is unchanged.

## Static checks
- Directory: 49 of 49 referenced CSS module classes exist.
- Page module classes matched.
- CSS braces balanced in both edited CSS modules.
- Theme-token usage and absence of hard-coded white panel backgrounds checked.
- Unit-test source updated for variable-driven light/dark controls and mobile breakpoints.

## Required release gate
1. Confirm Vercel Hobby build quota is available.
2. Run npm ci, npm run typecheck, focused Vitest, and npm run build on exact release candidate.
3. Visual QA in both themes: desktop 1440 px, tablet 768 px and phone 390 px. Check fonts, contrast, issuer dropdown, search/filters, images, expanded details, compare tray.
4. Smoke test /cards, /cards/all, /cards/compare, /cards/cashback, issuer and card details.
5. After explicit owner approval merge and stage/ship the release. Confirm Vercel production READY and live CSS asset. No unrelated changes.
6. If acceptance fails, use previous working production deployment for rollback.

Rollback anchor: main commit 0eaa2528525bd52a76f3d15df3b35725d7f2062e (start of design-only branch).
