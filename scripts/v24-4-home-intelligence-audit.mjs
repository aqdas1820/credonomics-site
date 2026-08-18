import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const files = {
  page: path.join(root, 'app', 'page.tsx'),
  component: path.join(
    root,
    'app',
    'components',
    'HomeIntelligenceRail.tsx',
  ),
  css: path.join(
    root,
    'app',
    'components',
    'home-intelligence.module.css',
  ),
  api: path.join(
    root,
    'app',
    'api',
    'home-intelligence',
    'route.ts',
  ),
}

const errors = []

for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) {
    errors.push(`Missing ${name}: ${file}`)
  }
}

if (!errors.length) {
  const page = fs.readFileSync(files.page, 'utf8')
  const component = fs.readFileSync(
    files.component,
    'utf8',
  )
  const api = fs.readFileSync(files.api, 'utf8')
  const css = fs.readFileSync(files.css, 'utf8')

  const pageCount = (
    page.match(/<HomeIntelligenceRail \/>/g) ?? []
  ).length

  if (pageCount !== 1) {
    errors.push(
      `Homepage intelligence component count is ${pageCount}, expected 1`,
    )
  }

  for (const marker of [
    "'/api/home-intelligence'",
    'Live intelligence',
    'Primary market',
    'Filing pipeline',
    'Mutual funds',
    'Research desk',
    'Automated intelligence layer',
  ]) {
    if (!component.includes(marker)) {
      errors.push(
        `Home intelligence component missing marker: ${marker}`,
      )
    }
  }

  for (const marker of [
    '../../data/ipo-dashboard.generated',
    '/data/mf-intelligence/index.json',
    "'public'",
    "'reports'",
    'latestReport()',
    'ipoDashboardRecords',
    "'/data/ipo-intelligence/index.json'",
    "'/data/mf-intelligence/index.json'",
    "'/data/mf-intelligence/schemes.json'",
    "'/data/mf-intelligence/portfolios_public.json'",
    "'/data/mf-intelligence/holdings_public.json'",
    "'/data/mf-intelligence/latest.json'",
    "'/data/mf-intelligence/manifest.json'",
    'collectionCount(',
  ]) {
    if (!api.includes(marker)) {
      errors.push(
        `Home intelligence API missing marker: ${marker}`,
      )
    }
  }

  for (const marker of [
    '.grid',
    '@media (max-width: 720px)',
    "html[data-theme='light']",
    'prefers-reduced-motion',
  ]) {
    if (!css.includes(marker)) {
      errors.push(
        `Home intelligence CSS missing marker: ${marker}`,
      )
    }
  }

  const allSource = page + component + api + css

  if (
    allSource.includes('\u00e2\u20ac\u201d') ||
    allSource.includes('\u00e2\u201a\u00b9')
  ) {
    errors.push(
      'Visible mojibake detected in V24 source',
    )
  }
}

console.log('')
console.log('CredoNomics V24.4 Home Intelligence Audit')
console.log('=======================================')
console.log(`Errors: ${errors.length}`)

if (errors.length) {
  console.log('')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('V24.4 homepage intelligence audit PASSED.')