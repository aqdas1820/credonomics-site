import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let failed = false

const checks = [
  ['app/layout.tsx', ["name: siteIdentity.name", "'@type': 'Organization'", "'@type': 'WebSite'", "alternateName: siteIdentity.alternateName"]],
  ['app/robots.ts', ["sitemap: 'https://www.credonomics.in/sitemap.xml'", "allow: '/'"]],
  ['app/sitemap.ts', ["cards/all", "official", "verifiedRealCards", "issuerRegistry"]],
  ['middleware.ts', ["host === 'credonomics.in'", "www.credonomics.in", "NextResponse.redirect"]],
  ['app/official/page.tsx', ['www.credonomics.in', 'similarly named websites']],
  ['app/cards/all/page.tsx', ['All Verified Credit Cards', 'CardDirectory']],
]

for (const [file, markers] of checks) {
  const full = path.join(root, file)
  if (!fs.existsSync(full)) {
    console.error(`FAIL ${file}: missing`)
    failed = true
    continue
  }
  const text = fs.readFileSync(full, 'utf8')
  const missing = markers.filter((marker) => !text.includes(marker))
  if (missing.length) {
    console.error(`FAIL ${file}: missing marker(s): ${missing.join(', ')}`)
    failed = true
  } else {
    console.log(`OK   ${file}`)
  }
}

for (const icon of [
  'public/favicon.ico',
  'public/favicon-48.png',
  'public/favicon-96.png',
  'public/apple-touch-icon.png',
  'app/icon.png',
  'app/apple-icon.png',
]) {
  if (!fs.existsSync(path.join(root, icon))) {
    console.error(`FAIL ${icon}: missing`)
    failed = true
  } else {
    console.log(`OK   ${icon}`)
  }
}

if (failed) process.exit(1)
console.log('CredoNomics SEO/entity source audit passed.')
