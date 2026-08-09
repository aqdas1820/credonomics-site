# CredoNomics Website

A clean finance/product portfolio website inspired by the minimal product showcase approach of SidBuilds, implemented with original copy and branding.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Customize
- Replace `hello@credonomics.in` with your actual email.
- Replace placeholder YouTube/X links in `app/page.tsx`.
- Turn tool cards into real pages as calculators are built.
- Connect newsletter CTA to your preferred email platform.

## Stack
Next.js 14, React, TypeScript, CSS, lucide-react.

## MF Intelligence Pro

`/tools/mf-portfolio-tracker` is now a scalable mutual-fund portfolio intelligence dashboard. It supports AMC/scheme/date filtering, month-on-month movement analysis, consensus/favourite stocks, sector shifts, stock conviction ranking, CSV export and importing normalized portfolio history.

A demo dataset is included at `public/data/mf-intelligence/demo.json`. For production, generate `public/data/mf-intelligence/all.json` from normalized AMC portfolio exports using `scripts/mf_intelligence/build_dataset.py`. The dashboard automatically prefers `all.json` and falls back to demo data if it is absent.
