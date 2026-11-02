# Contributing to CredoNomics

Thanks for taking the time to improve the CredoNomics web platform.

## Before you start

For substantial changes, open an issue first and describe the problem, proposed scope, and expected user impact. Keep pull requests focused; unrelated changes should be split into separate PRs.

Do not include confidential or regulated information in issues, commits, fixtures, screenshots, logs, or pull requests. Use synthetic data for financial, identity, account, payment, and customer scenarios.

## Development setup

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run build
npm run lint
npm run typecheck
npm test
npm run test:smoke
```

Run the checks relevant to your change and document the exact commands and results in the pull request.

## Engineering expectations

- Preserve existing security, privacy, SEO, accessibility, and responsive behavior.
- Do not weaken authentication, authorization, validation, rate limits, origin checks, or secret handling.
- Do not commit `.env` files, tokens, API keys, credentials, private datasets, production exports, customer records, or bank/payment information.
- Do not enable payments, settlement, production migrations, or other financially consequential behavior through an ordinary contribution.
- Avoid adding dependencies unless the benefit, license, maintenance impact, and security implications are clear.
- Keep generated financial datasets reproducible and document their source/build process.
- Add or update tests for user-visible behavior and important failure cases.

## Pull requests

A good PR explains:

- what changed and why
- what is intentionally out of scope
- validation performed
- security/privacy implications
- deployment or data-migration impact
- screenshots for meaningful UI changes

Never claim a deployment, production state, financial activation, certification, or external-provider acceptance unless it has actually been verified.

## Security issues

Do not open a public issue for a suspected vulnerability. Follow [SECURITY.md](SECURITY.md) and report it privately to **support@credonomics.in**.

## Company contact

CredoNomics Investment Solutions  
Website: https://credonomics.in  
Founder / business: founder@credonomics.in  
Product support: support@credonomics.in
