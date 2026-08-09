# MF Intelligence data pipeline

The web dashboard accepts one normalized dataset covering any number of AMCs, schemes and months. For a five-year monthly history, load up to 60 months of portfolio disclosures.

Required logical columns: `AMC`, `Scheme`, `Month`, `Stock`, `Sector`, `Weight`.

The builder accepts CSV/XLSX exports and common column-name variants, deduplicates holdings, normalizes months to `YYYY-MM`, and writes a static JSON file that the Next.js dashboard reads.

Example:

```powershell
python -m pip install pandas openpyxl
python scripts/mf_intelligence/build_dataset.py "D:\MF_Portfolios" public/data/mf-intelligence/all.json
```

For production coverage, create one normalized row per security per scheme per month from official AMC/AMFI portfolio disclosures. The dashboard is intentionally source-agnostic so the extraction layer can evolve without redesigning the site.
