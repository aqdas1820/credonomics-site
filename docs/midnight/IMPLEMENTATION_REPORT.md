# Midnight Intelligence implementation and release gate

Base: `a0ba47d10fbbf2131a8a3c2700aa96b65dce06e8`
Branch: `design/midnight-intelligence-20261023`

## Changes

Unified navy/cyan tokens and light reading theme across the shared shell and product modules; replaced continuous hero/cursor/marquee effects with a finite source-network SVG; introduced contextual workflow accents; corrected the second homepage h1 to h2; improved search modality, keyboard behavior, focus restoration and result semantics; made mobile menu dismissible with Escape/outside click; added account and discovery access; corrected footer destinations; removed nested main landmarks in presentation components. MF changes preserve its calculation/data/event code byte-for-byte except its outer landmark tag, verified by the audit script.

No production deployment, merge, protected-service restart, authentication-policy change, payment attempt or financial-record change is authorized by this branch.

## Verification

- Baseline: 81 existing unit tests passed; baseline production build passed.
- After: see VALIDATION.md for final results and the committed route audit.
- Existing image/lint and autoprefixer warnings remain; dependencies and lockfile are unchanged.
- Browser QA is currently blocked: the managed preview supervisor passes Vite-specific `--host`/`--strictPort` flags to Next.js. Existing Playwright smoke tests also could not launch because the required Chromium executable is missing. A browser download attempt returned an invalid/truncated archive. These are environment limitations, not passing browser results.
- Screenshots, responsive/cross-browser verification, screen-reader checks, axe/Lighthouse and before/after LCP/INP/CLS are not verified. Do not treat this branch as final acceptance or production-ready until these checks pass.

## Rollback

Production has not changed, so no production rollback is needed. To discard a preview, cancel that preview only or redeploy its base SHA to the preview environment. Do not promote, change domains or modify production configuration. If reverting this implementation on the development branch later, use `git revert` on its implementation commit (recorded in the handover/PR), then build and retest. Preserve financial databases and secrets; there is no migration or data rollback.

## Reproduce

`npm ci --ignore-scripts`, `npm test`, `npm run typecheck`, `node scripts/ui/audit-midnight.mjs`, `npx next build`.

For browser QA on a supported machine: `npx playwright install chromium`, then `npm run test:smoke`. The existing projects exercise 1440, 768 and 375px; the new suite captures representative screenshots. Also run at 320, 1024px and 200% zoom, reduced motion, dark/light themes and an independent browser before approval. Do not test real payment collection or modify account state as part of UI verification.
