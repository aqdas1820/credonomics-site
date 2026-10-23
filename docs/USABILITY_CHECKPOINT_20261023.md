# Usability changes and recovery checkpoint

## Preserved baseline

- Production commit: `e0310b510a06cc3a612c9a5c227345c996d7d13c`
- Recovery branch: `backup/live-before-usability-20261023`
- Existing READY production deployment: `dpl_ESCR82ZiG78gDqCFiBotePdTH4z5`
- Existing immutable deployment URL: https://credonomics-site-oaq4xdqp6-aqdasshaikh1820-9566s-projects.vercel.app
- Working branch: `feat/usability-checkpoint-20261023`

The recovery branch points to the full existing website, including the restored round hero and interactive discovery. This change is preview-only. No production merge, domain reassignment, protected-service restart, or payment operation is authorized by this change.

## Changes

- Homepage discovery query/category persist in `discovery_q` / `discovery_category` URL parameters. Reload and returning from a detail page restore them.
- Full search uses `q` / `category`. Continuing from discovery retains both filters. Existing unrelated URL parameters, anchor and Next.js history state are preserved.
- Invalid category URLs fall back to All. Reset removes only that workspace's filters.
- Mobile support launcher and optional invitation occupy normal document space at the end of homepage content instead of covering research cards. Desktop launcher, existing dialog and contribution implementation are unchanged.
- Full search has a named search input, pressed filter states, announced result count, visible keyboard focus and 44px filter targets. Removed its redundant nested main landmark.
- No animation/hero files, financial formulas, source values, disclosures, authentication, payment code or dependency manifests changed.

## Recovery

Before production release, discard the preview/working branch to retain the existing live state; no rollback operation is needed.

If later released, prepare a development branch reverting the usability commit (or `git revert -m 1 <merge-sha>` if merged using a merge commit). Validate and release that revert only with production approval. Avoid resetting main or restoring the entire old tree over unrelated future changes.

For an urgent deployment rollback, the preserved production deployment ID above identifies the exact baseline. Reassigning production to it requires separate approval; Vercel rollback may also disable automatic production domain assignment until promotion restores it.

## Validation

- 128 unit tests passed across 19 files, including URL round-trip, reset, invalid category and unrelated URL/anchor preservation.
- TypeScript check passed.
- Browser regression specifications cover reload, category handoff, return navigation and mobile support dialog. Local execution is blocked because the Playwright Chromium executable is absent; do not interpret this as a passing browser suite.
- Build and hosted preview verification are recorded in the pull request.

## Exact changed files

- `app/components/DiscoveryExplorer.tsx`
- `app/components/useDiscoveryFilters.ts`
- `app/components/support-credonomics.module.css`
- `app/lib/discovery-filters.ts`
- `app/search/SearchWorkspace.tsx`
- `app/search/search.module.css`
- `tests/e2e/interactive-discovery.spec.ts`
- `tests/unit/discovery-filters.test.ts`
- `docs/USABILITY_CHECKPOINT_20261023.md`

Scope: homepage and full search; support CSS affects its existing homepage use only. Other routes retain their existing implementation. The third-party avatar remains a later, separate integration decision.
