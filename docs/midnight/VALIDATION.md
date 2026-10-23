# Validation results

- Existing baseline: 81 unit tests, 17 suites, passed.
- Final: 125 unit tests, 18 suites, passed, including 44 actual palette contrast combinations.
- Production build: passed. Type validation included in the build; standalone typecheck also passed.
- Route/source audit: 52 page templates, 22 API handlers; zero protected/source/data/config changes; MF financial code unchanged.
- `git diff --check`: passed.
- Browser smoke: 14 launch failures, all due to missing Chromium, before any page assertion. Installing the pinned browser failed because the download was invalid/truncated. Do not count these as passes.
- New representative screenshots/search/reduced-motion scenarios are committed, but have not run successfully here.
- Managed preview: unavailable because its injected Vite flags are incompatible with this Next.js application. No production configuration was changed to work around it.

## Build artifact comparison

Same repository, pinned dependencies, local production builds. These are Next.js build estimates, not measured Web Vitals. Added shared navigation/search/context code increases some shared first-load estimates; the homepage's own JS is smaller after removal of pointer effects. No framework/dependency upgrade was performed.

| Route | Before route JS | After route JS | Before first load JS | After first load JS |
|---|---:|---:|---:|---:|
| `/` | 12.2 kB | 10.2 kB | 118 kB | 118 kB |
| `/research` | 1.86 kB | 1.94 kB | 108 kB | 109 kB |
| `/ipo/current` | 159 B | 160 B | 112 kB | 114 kB |
| `/mutual-funds` | 2.21 kB | 2.25 kB | 108 kB | 110 kB |
| `/tools/mf-portfolio-tracker` | 15.7 kB | 15.4 kB | 112 kB | 112 kB |
| `/cards/all` | 3.67 kB | 3.72 kB | 110 kB | 111 kB |
| `/cards/analyzer` | 5.88 kB | 5.93 kB | 112 kB | 113 kB |
| `/tools` | 1.86 kB | 1.94 kB | 108 kB | 109 kB |
| `/discover` | 2.17 kB | 2.22 kB | 108 kB | 110 kB |
| `/methodology` | 1.88 kB | 1.94 kB | 108 kB | 109 kB |

## Pending acceptance gates

Rendered screenshots for all page families and instantiated dynamic records; 320/375/768/1024/1440px and 200% zoom; keyboard/focus checks; light/dark/reduced-motion checks; screen reader and axe; Firefox/WebKit; Lighthouse and comparable before/after LCP/INP/CLS (field p75 where available). No claim of WCAG certification, ≥90 Lighthouse or attained Web Vitals is made. Production acceptance remains pending.
