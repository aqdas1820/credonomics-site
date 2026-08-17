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
console.log('CredoNomics V22.2 IPO Automation Audit')
console.log('====================================')
console.log(`Issues: ${data?.issues?.length ?? 0}`)
console.log(`Healthy source layers: ${healthySources}`)
console.log(`Errors: ${errors.length}`)

for (const error of errors) console.error(`  - ${error}`)

if (errors.length) process.exit(1)

console.log('V22.2 IPO automation audit PASSED.')