import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const errors = []

function read(relative) {
  const file = path.join(root, relative)

  if (!fs.existsSync(file)) {
    errors.push(`Missing ${relative}`)
    return ''
  }

  return fs.readFileSync(file, 'utf8')
}

const dataText = read('public/data/ipo-intelligence/index.json')
const generated = read('app/data/ipo-dashboard.generated.ts')
const dashboardClient = read('app/ipo/IPODashboardClient.tsx')
const detail = read('app/ipo/company/[slug]/page.tsx')
const workflow = read('.github/workflows/ipo-intelligence-refresh.yml')
const packageText = read('package.json')

let data = null

try {
  data = JSON.parse(dataText)
} catch {
  errors.push('IPO intelligence JSON is invalid')
}

if (!Array.isArray(data?.issues) || data.issues.length < 1) {
  errors.push('IPO intelligence dataset contains no issues')
}

const generatedRecordCount =
  (generated.match(/"id": "auto:/g) ?? []).length

if (
  Array.isArray(data?.issues) &&
  generatedRecordCount !== data.issues.length
) {
  errors.push(
    `Dashboard adapter count mismatch: JSON has ${data.issues.length} issues, ` +
      `generated adapter has ${generatedRecordCount}`,
  )
}

if (generatedRecordCount < 1) {
  errors.push('Generated dashboard adapter contains zero IPO records')
}

if (Array.isArray(data?.issues)) {
  const badDraftMarketRecords = data.issues.filter((issue) => {
    const filing = String(issue.sebiFilingType ?? '').toUpperCase()
    const labels = Array.isArray(issue.sourceLabels)
      ? issue.sourceLabels
      : []

    const marketSource =
      labels.includes('NSE public issue board') ||
      labels.includes('NSE IPO Tracker')

    return (
      filing.includes('DRHP') &&
      !marketSource &&
      issue.status !== 'Research'
    )
  })

  if (badDraftMarketRecords.length) {
    errors.push(
      `DRHP-only records incorrectly appear as market IPOs: ` +
        badDraftMarketRecords.map((item) => item.company).join(', '),
    )
  }

  const malformed = data.issues.filter((issue) => {
    const price = String(issue.priceBand ?? '').trim()
    const size = String(issue.issueSize ?? '').trim()

    const badPrice =
      price &&
      !/^\u20b9[\d,]+(?:\.\d+)?\s+[\u2013-]\s+\u20b9[\d,]+(?:\.\d+)?$/.test(price)

    const badSize =
      size &&
      !/^\u20b9[\d,.]+\s+Cr$/i.test(size)

    return badPrice || badSize
  })

  if (malformed.length) {
    errors.push(
      `Malformed IPO monetary fields remain: ` +
        malformed.map((item) => item.company).join(', '),
    )
  }
}

const forbiddenDashboardRegressions = [
  [
    'legacy All filter',
    /['"]All['"]\s*,\s*['"]All['"]/.test(dashboardClient),
  ],
  [
    'legacy default All state',
    /useState\(\s*['"]All['"]\s*\)/.test(dashboardClient),
  ],
  [
    'legacy CredoNomics dataset label',
    /CredoNomics dataset/i.test(dashboardClient),
  ],
]

for (const [label, present] of forbiddenDashboardRegressions) {
  if (present) errors.push(`IPO dashboard regression detected: ${label}`)
}

const dashboardQualityChecks = [
  [
    'Market filter option',
    /['"]Market['"]\s*,\s*['"]Market['"]/.test(dashboardClient),
  ],
  [
    'Filed filter option',
    /['"]Filed['"]\s*,\s*['"]Research['"]/.test(dashboardClient),
  ],
  [
    'Market default',
    /useState\(\s*['"]Market['"]\s*\)/.test(dashboardClient),
  ],
  [
    'Market behavior',
    /filter\s*===\s*['"]Market['"]/.test(dashboardClient) &&
      /record\.status\s*!==\s*['"]Research['"]/.test(dashboardClient),
  ],
  [
    'Filed behavior',
    /filter\s*===\s*['"]Research['"]/.test(dashboardClient) &&
      /record\.status\s*===\s*['"]Research['"]/.test(dashboardClient),
  ],
  [
    'Filed label helper',
    dashboardClient.includes('function statusLabel(status: string)'),
  ],
]

for (const [label, ok] of dashboardQualityChecks) {
  if (!ok) errors.push(`IPO dashboard quality check failed: ${label}`)
}

if (
  dashboardClient.includes('\u00e2\u20ac\u201d') ||
  dashboardClient.includes('\u00e2\u201a\u00b9')
) {
  errors.push('IPO dashboard source still contains visible mojibake')
}

const sourceHealth = data?.sourceHealth ?? {}
const healthySources = Object.values(sourceHealth)
  .filter((value) => typeof value === 'number' && value > 0)
  .length

if (healthySources < 2) {
  errors.push('Fewer than two official source layers are healthy')
}

if (!generated.includes('export const ipoDashboardRecords')) {
  errors.push('Generated IPO dashboard records missing')
}

if (!generated.includes('/ipo/company/')) {
  errors.push('Generated dashboard does not link to automated company pages')
}

for (const marker of [
  'Prospectus financials',
  'Key financial snapshot.',
  'Primary sources',
  'financialExtractionStatus',
]) {
  if (!detail.includes(marker)) {
    errors.push(`Automated IPO detail page missing: ${marker}`)
  }
}

for (const marker of [
  'schedule:',
  'python scripts/ipo_auto_fetch/fetch_ipo_intelligence.py',
  'node scripts/generate-ipo-dashboard.mjs',
  'npm run build',
]) {
  if (!workflow.includes(marker)) {
    errors.push(`GitHub workflow missing: ${marker}`)
  }
}

if (!packageText.includes('"ipo:refresh"')) {
  errors.push('package.json missing ipo:refresh command')
}

console.log('')
console.log('CredoNomics V22.9 IPO Automation Audit')
console.log('====================================')
console.log(`JSON issues: ${data?.issues?.length ?? 0}`)
console.log(`Dashboard adapter records: ${generatedRecordCount}`)
console.log(`Healthy source layers: ${healthySources}`)
console.log(`Errors: ${errors.length}`)

for (const error of errors) console.error(`  - ${error}`)

if (errors.length) process.exit(1)

console.log('V22.9 IPO automation audit PASSED.')