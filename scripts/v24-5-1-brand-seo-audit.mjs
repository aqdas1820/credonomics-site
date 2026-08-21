import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const files = {
  layout: 'app/layout.tsx',
  site: 'app/seo/site.ts',
  structured: 'app/components/SiteStructuredData.tsx',
  robots: 'app/robots.ts',
  sitemap: 'app/sitemap.ts',
}

const errors = []

for (const [name, relative] of Object.entries(files)) {
  if (!fs.existsSync(path.join(root, relative))) {
    errors.push(`Missing ${name}: ${relative}`)
  }
}

if (!errors.length) {
  const layout = fs.readFileSync(path.join(root, files.layout), 'utf8')
  const site = fs.readFileSync(path.join(root, files.site), 'utf8')
  const structured = fs.readFileSync(path.join(root, files.structured), 'utf8')

  for (const marker of [
    'https://www.credonomics.in',
    'CredoNomics Investment Solutions',
    'Financial Research & Intelligence',
    'metadataBase',
    'googleBot',
    'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
  ]) {
    if (!site.includes(marker)) {
      errors.push(`SEO identity missing: ${marker}`)
    }
  }

  for (const marker of [
    "'@type': 'Organization'",
    "'@type': 'WebSite'",
    'alternateName: BRAND_NAME',
    'publisher:',
  ]) {
    if (!structured.includes(marker)) {
      errors.push(`Structured identity missing: ${marker}`)
    }
  }

  if (!layout.includes('mergeRootMetadata')) {
    errors.push('Root layout missing mergeRootMetadata')
  }

  const hasStructuredIdentity =
    layout.includes('SiteStructuredData') ||
    (
      layout.includes('application/ld+json') &&
      (
        layout.includes('organizationId') ||
        layout.includes('websiteId') ||
        layout.includes("'@type': 'Organization'") ||
        layout.includes('\"@type\":\"Organization\"')
      )
    )

  if (!hasStructuredIdentity) {
    errors.push('Root layout missing Organization/WebSite structured identity')
  }

  const combined = layout + site + structured
  if (
    combined.includes('Credonomics Investment Solutions') ||
    combined.includes('CREDONOMICS Investment Solutions')
  ) {
    errors.push('Non-canonical brand casing found; expected CredoNomics Investment Solutions.')
  }
}

console.log('')
console.log('CredoNomics V24.5.1 Brand + Indexing Audit')
console.log('========================================')
console.log(`Errors: ${errors.length}`)

if (errors.length) {
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('V24.5.1 SEO/brand audit PASSED.')