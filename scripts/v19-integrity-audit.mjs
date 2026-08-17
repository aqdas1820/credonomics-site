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

const siteSearch = read('app/components/SiteSearch.tsx')
const siteHeader = read('app/components/SiteHeader.tsx')
const searchPage = read('app/search/page.tsx')
const searchWorkspace = read('app/search/SearchWorkspace.tsx')
const discoverPage = read('app/discover/page.tsx')
const homepageDiscovery = read('app/components/HomepageDiscovery.tsx')
const homePage = read('app/page.tsx')
const searchIndexText = read('app/data/search-index.generated.ts')

if (!siteSearch.includes('export default function SiteSearch')) {
  errors.push(
    'app/components/SiteSearch.tsx does not define the SiteSearch component',
  )
}

if (
  !siteHeader.includes("import SiteSearch from './SiteSearch'") &&
  !siteHeader.includes('import SiteSearch from "./SiteSearch"')
) {
  errors.push('app/components/SiteHeader.tsx is missing the SiteSearch import')
}

const headerSearchCount = (siteHeader.match(/<SiteSearch\s*\/>/g) ?? []).length

if (headerSearchCount !== 1) {
  errors.push(
    `app/components/SiteHeader.tsx must contain exactly one <SiteSearch />; found ${headerSearchCount}`,
  )
}

if (!searchPage.includes('SearchWorkspace')) {
  errors.push('app/search/page.tsx is not wired to SearchWorkspace')
}

if (!searchWorkspace.includes('export default function SearchWorkspace')) {
  errors.push(
    'app/search/SearchWorkspace.tsx does not define SearchWorkspace',
  )
}

if (!discoverPage.includes('export default function DiscoverPage')) {
  errors.push('app/discover/page.tsx does not define DiscoverPage')
}

if (!discoverPage.includes('BreadcrumbList')) {
  errors.push('app/discover/page.tsx is missing BreadcrumbList structured data')
}

if (!homepageDiscovery.includes('export default function HomepageDiscovery')) {
  errors.push(
    'app/components/HomepageDiscovery.tsx does not define HomepageDiscovery',
  )
}

const homeDiscoveryCount =
  (homePage.match(/<HomepageDiscovery\s*\/>/g) ?? []).length

if (homeDiscoveryCount !== 1) {
  errors.push(
    `app/page.tsx must contain exactly one <HomepageDiscovery />; found ${homeDiscoveryCount}`,
  )
}

if (!searchIndexText.includes('export const searchIndex')) {
  errors.push('Generated search index export is missing')
}

const hrefCount = (searchIndexText.match(/"href":/g) ?? []).length

if (hrefCount < 10) {
  errors.push(`Search index is too small: ${hrefCount} entries`)
}

const requiredRoutes = [
  '/research',
  '/ipo',
  '/tools',
  '/tools/mf-portfolio-tracker',
]

for (const route of requiredRoutes) {
  if (!searchIndexText.includes(`"href": "${route}"`)) {
    errors.push(`Search index missing core route ${route}`)
  }
}

if (!searchPage.includes('index: false')) {
  errors.push('/search must remain noindex')
}

console.log('')
console.log('CredoNomics V19.3 Integrity Audit')
console.log('=================================')
console.log(`Search entries: ${hrefCount}`)
console.log(`Header search instances: ${headerSearchCount}`)
console.log(`Homepage discovery instances: ${homeDiscoveryCount}`)
console.log(`Errors: ${errors.length}`)

for (const error of errors) {
  console.error(`  - ${error}`)
}

if (errors.length) {
  process.exit(1)
}

console.log('V19.3 integrity audit PASSED.')