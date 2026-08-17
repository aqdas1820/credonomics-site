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

const mfPage = read('app/mutual-funds/page.tsx')
const mfCss = read('app/mutual-funds/mutual-funds.module.css')
const search = read('app/components/SiteSearch.tsx')
const searchIndex = read('app/data/search-index.generated.ts')
const pkg = JSON.parse(read('package.json') || '{}')
const sitemapPath = path.join(root, 'app', 'sitemap.ts')

if (!mfPage.includes("canonical: '/mutual-funds'")) {
  errors.push('/mutual-funds canonical metadata missing')
}

if (!mfPage.includes("'@type': 'CollectionPage'")) {
  errors.push('/mutual-funds CollectionPage structured data missing')
}

if (!mfPage.includes("'@type': 'BreadcrumbList'")) {
  errors.push('/mutual-funds breadcrumb structured data missing')
}

if (!mfPage.includes('/tools/mf-portfolio-tracker')) {
  errors.push('/mutual-funds does not link to the tracker')
}

if (!mfCss.includes('@media(max-width:680px)')) {
  errors.push('/mutual-funds phone breakpoint missing')
}

if (!searchIndex.includes('"href": "/mutual-funds"')) {
  errors.push('Generated search index is missing /mutual-funds')
}

const mfHubCategoryForward = /"href": "\/mutual-funds"[\s\S]{0,300}"category": "Mutual Funds"/
const mfHubCategoryReverse = /"category": "Mutual Funds"[\s\S]{0,300}"href": "\/mutual-funds"/
if (!mfHubCategoryForward.test(searchIndex) && !mfHubCategoryReverse.test(searchIndex)) { errors.push('/mutual-funds is not classified as Mutual Funds in search') }

if (
  !pkg.scripts?.prebuild ||
  !pkg.scripts.prebuild.includes('scripts/generate-search-index.mjs')
) {
  errors.push('package.json prebuild is not refreshing the search index')
}

for (const marker of [
  'export default function SiteSearch',
  'role="dialog"',
  'aria-modal="true"',
  'aria-label="Search CredoNomics"',
]) {
  if (!search.includes(marker)) {
    errors.push(`SiteSearch structural marker missing: ${marker}`)
  }
}

if (!sitemapPath || !fs.existsSync(sitemapPath)) {
  console.log('Existing sitemap is absent; V20 does not create or modify it.')
}

console.log('')
console.log('CredoNomics V20.3 Architecture Audit')
console.log('=================================')
console.log(`Errors: ${errors.length}`)

for (const error of errors) console.error(`  - ${error}`)

if (errors.length) process.exit(1)

console.log('V20.3 architecture audit PASSED.')