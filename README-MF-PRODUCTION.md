# CredoNomics MF Production Engine

This replaces the earlier `Unknown-AMC / 0 holdings` experiment.

It uses the master workbooks already created by your **MF Tracking** project and
publishes a lightweight, month-by-month dataset for the CredoNomics website.

## What it uses from your existing project

Your extractor already stores the useful fields required by the site:

- AMC
- Scheme
- Report_Date
- Company
- ISIN
- Industry
- Asset_Class
- Portfolio_Weight_Percent
- Extraction_Method

The production builder compares:

1. `Master_Portfolio_All_AMCs_V3.xlsx`
2. `Master_Portfolio_All_AMCs_V2.xlsx`
3. `Master_Portfolio_All_AMCs.xlsx`

It cleans each candidate and automatically chooses the source with the best
AMC + scheme + historical-month coverage. This avoids selecting V3 merely
because it is newer when it contains far fewer usable holdings.

## Data-quality layer

The builder:

- removes obvious factsheet paragraphs, headers, totals and disclaimers
- removes debt / money-market / cash rows from the equity-intelligence dataset
- checks portfolio weights
- prefers valid ISINs for identity
- gives table-extracted rows a higher quality score
- rejects low-confidence rows
- de-duplicates by AMC + Scheme + Month + security identity

## Website storage

Instead of one enormous `all.json`, data is written month by month:

`public/data/mf-intelligence/index.json`

`public/data/mf-intelligence/holdings/2026-07.json`

`public/data/mf-intelligence/holdings/2026-06.json`

etc.

The replacement Next.js page loads only the two months the visitor is comparing.
This is much more scalable for a five-year dataset.

## Installation

Extract this ZIP directly into your existing CredoNomics project:

`C:\Users\Aqdas Shaikh\Downloads\credonomics-site\credonomics-site`

Merge/replace the included `scripts` and `app` folders.

Your existing `app/globals.css` is NOT replaced.

## Step 1 — build the production dataset

From the CredoNomics project folder:

```powershell
python scripts\mf_site\build_credonomics_dataset.py --reports "D:\MF Tracking\Reports"
```

The program prints a comparison of V3 / V2 / original and tells you which
workbook it selected.

## Step 2 — test the website locally

```powershell
npm run build
```

Then:

```powershell
npm run dev
```

Open:

`http://localhost:3000/tools/mf-portfolio-tracker`

Check:

- Production dataset badge
- AMC dropdown
- Scheme dropdown
- month dropdowns
- favourite-stock ranking
- holding changes
- sector shifts

## Step 3 — deploy

Only after the local build is successful:

```powershell
git add app/tools/mf-portfolio-tracker/page.tsx scripts/mf_site public/data/mf-intelligence
git commit -m "Launch production MF portfolio intelligence engine"
git push origin main
```

## Monthly update workflow

Keep your existing MF Tracking project as the data engine.

Each month:

1. download/update factsheets in `D:\MF Tracking`
2. run your extractor to update the master workbooks
3. rerun:

```powershell
python scripts\mf_site\build_credonomics_dataset.py --reports "D:\MF Tracking\Reports"
```

4. commit only the generated `public/data/mf-intelligence` changes

The next step after this works is to automate steps 1-4 with Task Scheduler or
GitHub Actions/another backend runner.
# Production projection (Phase 2)

The only mutual-fund dataset shipped to browsers is `public/data/mf-intelligence/v2/`.
Source workbooks, legacy exports, backups, review queues and pipeline diagnostics belong
under `data/` and must not be copied into `public`.

The deterministic release sequence is:

1. Run the approved ingestion and normalization pipeline against AMC disclosures.
2. Generate v2 with `scripts/mf_site/publish_mf_intelligence_v2.py --source <verified-workbook> --output public/data/mf-intelligence/v2`.
3. Run `npm run mf:publish`. It enriches legacy metadata, moves diagnostics out of the browser payload, and validates the production projection.
4. `npm run mf:validate` can be run independently. It fails when metadata, indexed months, monthly shards, or latest-month alignment are invalid.
5. Run `npm run typecheck`, `npm test`, and `npm run build` before deployment.

Every public financial projection carries `source`, `asOf`, `generatedAt`, `quality`,
and `availability`. The current v2 projection is intentionally labelled stale/low quality
because it ends in February 2026 and has insufficient verified ISIN coverage. Do not change
that label to live without a newly generated and validated source dataset.
