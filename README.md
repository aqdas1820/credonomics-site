<div align="center">

# CredoNomics

### Financial products, research and consumer-finance tooling by CredoNomics Investment Solutions

[![Website](https://img.shields.io/badge/Website-credonomics.in-0B7285?style=for-the-badge&logo=googlechrome&logoColor=white)](https://credonomics.in)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=111827)](https://react.dev/)

</div>

## Overview

This repository powers the public **CredoNomics** web platform from **CredoNomics Investment Solutions**. It combines financial-product discovery, research experiences and interactive consumer-finance tooling in a modern Next.js application.

The production website is available at **[credonomics.in](https://credonomics.in)**.

## Product areas

- Financial-product and research experiences
- Mutual-fund portfolio intelligence and historical portfolio analysis
- Data-backed financial tools and dashboards
- Search/index generation and structured financial datasets
- Responsive web experiences for desktop and mobile

### MF Intelligence Pro

`/tools/mf-portfolio-tracker` provides mutual-fund portfolio intelligence with AMC, scheme and date filtering, month-on-month movement analysis, consensus/favourite stocks, sector shifts, stock-conviction ranking, CSV export and normalized portfolio-history imports.

A demo dataset is available at `public/data/mf-intelligence/demo.json`. Production datasets can be generated from normalized AMC portfolio exports using `scripts/mf_intelligence/build_dataset.py`; the application prefers `public/data/mf-intelligence/all.json` when present and falls back to demo data otherwise.

## Technology

- **Next.js 15**
- **React 19**
- **TypeScript**
- **Supabase**
- **Lightweight Charts**
- **Zod**
- **Vitest**
- **Playwright**
- **Vercel**

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Useful commands

```bash
npm run build
npm run lint
npm run typecheck
npm test
npm run test:smoke
```

Additional repository scripts support IPO intelligence generation, mutual-fund metadata/data publication and equity-instrument dataset workflows. See `package.json` and the relevant scripts under `scripts/` for the current commands.

## Configuration

Start with `.env.example` and provide only the environment variables required for the feature set you are running. Do not commit secrets or production credentials.

## Repository structure

```text
app/        Next.js application and routes
data/       project data inputs
public/     public assets and generated datasets
scripts/    data, search-index and publishing workflows
docs/       project documentation
```

## Deployment

The public product is served through **[credonomics.in](https://credonomics.in)**. Deployment configuration and environment-specific secrets should remain outside source control.

## Company & contact

**CredoNomics Investment Solutions**

- Website: [credonomics.in](https://credonomics.in)
- Company Instagram: [@credonomics.in](https://instagram.com/credonomics.in)
- Founder / business: [founder@credonomics.in](mailto:founder@credonomics.in)
- Product support: [support@credonomics.in](mailto:support@credonomics.in)
- Phone: `02562455327`

---

<div align="center">

Built and maintained by **CredoNomics Investment Solutions**.

</div>
