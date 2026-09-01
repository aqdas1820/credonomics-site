# CredoNomics Strict ISIN Cleaner

This package is the next production-quality step for the MF Intelligence project.

It does **not** trust every extracted row. It performs a strict security audit first.

## Why

Your previous production build found:

- 104,736 cleaned rows
- 3 AMCs
- 176 schemes
- 138 months
- 31,881 apparent "stocks"

That stock count is too high for a credible mutual-fund equity database, which indicates
factsheet text/extraction noise is still present.

## Strict production rule

A row is accepted only when:

- AMC exists
- Scheme exists
- Report date exists
- Portfolio weight is sensible
- security has a valid Indian ISIN (`IN` + 10 alphanumeric characters)
- row is equity-like
- company text passes junk filters
- row achieves a quality score of at least 8

ISIN becomes the primary security identifier.

## Step 1 — run the audit

From the CredoNomics project folder:

```powershell
python scripts\mf_site\strict_isin_cleaner.py --input "D:\MF Tracking\Reports\Master_Portfolio_All_AMCs.xlsx" --output "D:\MF Tracking\Reports\CredoNomics_Verified"
```

It creates:

- `Verified_Equity_Holdings.xlsx`
- `Rejected_Rows_Sample.xlsx`
- `Rejection_Summary.xlsx`
- `quality_summary.json`

Do not publish anything until the printed counts look sensible.

## Step 2 — publish only verified data

After the audit looks good:

```powershell
python scripts\mf_site\publish_verified_dataset.py --input "D:\MF Tracking\Reports\CredoNomics_Verified\Verified_Equity_Holdings.xlsx"
```

That generates:

- `public/data/mf-intelligence/index.json`
- monthly holdings JSON files

## Step 3 — local website test

```powershell
npm run build
npm run dev
```

Open:

`http://localhost:3000/tools/mf-portfolio-tracker`

## Important

This cleaner intentionally rejects rows without a valid Indian ISIN. That may exclude some
legitimate foreign securities, REIT/InvIT edge cases, or older disclosures where ISIN data
was absent. This is deliberate for the first production release: false negatives are safer
than publishing false holdings.

Later we can add a reviewed secondary acceptance path for those asset types.
