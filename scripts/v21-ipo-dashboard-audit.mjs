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

const page = read('app/ipo/page.tsx')
const client = read('app/ipo/IPODashboardClient.tsx')
const css = read('app/ipo/ipo-dashboard.module.css')
const generated = read('app/data/ipo-dashboard.generated.ts')
const pkg = JSON.parse(read('package.json') || '{}')

for (const marker of [
  "canonical: '/ipo'",
  "'@type': 'CollectionPage'",
  "'@type': 'BreadcrumbList'",
]) {
  if (!page.includes(marker)) errors.push(`IPO page missing ${marker}`)
}

for (const marker of [
  'IPO Market Board',
  'Current, upcoming and recently completed issues.',
  'Mainboard',
  'SME',
  'Search company, board or exchange',
  'Data shown here comes from CredoNomics',
]) {
  if (!client.includes(marker)) {
    errors.push(`IPO dashboard client missing ${marker}`)
  }
}

if (!css.includes('@media(max-width:720px)')) {
  errors.push('IPO dashboard mobile breakpoint missing')
}

if (!generated.includes('export const ipoDashboardRecords')) {
  errors.push('Generated IPO records export missing')
}

if (!generated.includes('export const ipoNavigation')) {
  errors.push('Generated IPO navigation export missing')
}

if (
  !pkg.scripts?.prebuild ||
  !pkg.scripts.prebuild.includes('scripts/generate-ipo-dashboard.mjs')
) {
  errors.push('IPO generator is not attached to prebuild')
}

console.log('')
console.log('CredoNomics V21 IPO Dashboard Audit')
console.log('===================================')
console.log(`Errors: ${errors.length}`)

for (const error of errors) console.error(`  - ${error}`)

if (errors.length) process.exit(1)

console.log('V21 IPO dashboard audit PASSED.')