# CredoNomics Investment Solutions

Production-ready Next.js website for CredoNomics with four working financial decision tools:

- Credit Card Finder — compare up to three cards using user-entered reward rates, caps, fees and waiver thresholds.
- Cashback Calculator — calculate effective cashback after exclusions, caps, annual fee, GST and fee waiver.
- Fuel Card Optimizer — calculate fuel rewards, surcharge, waiver, app benefits and net annual savings.
- MF Portfolio Tracker — paste or upload two CSV/text portfolio snapshots and compare new holdings, exits and weight changes.

Also includes a research hub, responsive design, SEO metadata, robots.txt and sitemap generation.

## Deploy update
Copy the files into the existing Git-connected `credonomics-site` folder, then run:

```bash
git status
git add app public README.md package.json package-lock.json tsconfig.json .gitignore
git commit -m "Launch complete CredoNomics financial tools suite"
git push origin main
```

Vercel will redeploy the existing domain automatically.

## Important
The tools are informational. Product terms, reward rules, fees and fund disclosures can change; verify current official issuer/AMC documents before making a financial decision.
