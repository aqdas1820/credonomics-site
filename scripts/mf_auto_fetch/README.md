# CredoNomics — Automatic MF Portfolio Data Pipeline

This update makes the existing MF Portfolio Intelligence page capable of reading
an automatically refreshed production dataset from:

`public/data/mf-intelligence/all.json`

Your current tracker already checks for `all.json` first and falls back to
`demo.json`, so no UI rewrite is required.

## Source strategy

The primary discovery source is the official AMFI Portfolio Disclosure page:

https://www.amfiindia.com/online-center/portfolio-disclosure

The browser automation deliberately discovers download links from AMFI rather than
hard-coding an undocumented private API. It also captures spreadsheet URLs returned
by browser network requests.

SEBI states that mutual funds must disclose full portfolios of all schemes monthly
on their own websites and AMFI. Use spreadsheet disclosures wherever possible for
auditable extraction.

## Files

- `requirements-mf.txt`
- `scripts/mf_auto_fetch/fetch_amfi.py`
- `scripts/mf_auto_fetch/normalize_portfolios.py`
- `scripts/mf_auto_fetch/merge_history.py`
- `scripts/mf_auto_fetch/run_pipeline.py`
- `.github/workflows/mf-portfolio-refresh.yml`
- `public/data/mf-intelligence/status.json`

## Local test

From the project root:

```powershell
pip install -r requirements-mf.txt
python -m playwright install chromium
python scripts/mf_auto_fetch/run_pipeline.py --months 1
```

Then inspect:

`public/data/mf-intelligence/status.json`

and run:

```powershell
npm run build
npm run dev
```

## 5-year backfill

Run manually:

```powershell
python scripts/mf_auto_fetch/run_pipeline.py --months 60
```

Or open GitHub → Actions → **Refresh MF portfolio intelligence** → Run workflow
and enter `60`.

Important: five years × all AMCs is a large discovery job. Run the 60-month backfill
manually, not every month.

## Monthly automation

The included GitHub Actions workflow runs on the 12th of every month, fetches the
latest disclosures, merges them into `all.json`, and commits only if data changed.
That new commit triggers your existing Vercel deployment automatically.

## Data fields

Each normalized row contains:

- `amc`
- `scheme`
- `month`
- `stock`
- `sector`
- `weight`
- `isin`
- `source_file`

The frontend ignores extra fields it doesn't use, so adding `isin` and provenance
does not break the current UI.

## Reliability notes

AMC spreadsheet layouts vary. The normalizer searches sheets for semantic headers
such as ISIN, Name of Instrument, Industry/Sector and % to NAV instead of depending
on one fixed row number.

PDF-only disclosures are intentionally skipped rather than OCR'd. This avoids
silently creating unreliable portfolio data. The console output tells you which
files were skipped so an AMC-specific adapter can be added when necessary.

Because AMFI can change page markup, treat the first run as a verification run.
If discovery returns zero files, run:

```powershell
python scripts/mf_auto_fetch/fetch_amfi.py --months 1 --headed
```

to watch the browser and adjust selector heuristics if AMFI has changed its UI.
