import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const layoutFile = path.join(root, 'app', 'layout.tsx')
const homeFile = path.join(root, 'app', 'page.tsx')

function addImport(text, line) {
  if (text.includes(line)) return text

  // V24.5.1 fix: do not insert after a line that only starts a
  // multi-line import such as `import {`. Prepending a complete import
  // keeps every existing import declaration intact.
  const directive = text.match(
    /^\uFEFF?(?:\s*['"]use [^'"]+['"];?\s*)+/,
  )
  const at = directive ? directive[0].length : 0

  return text.slice(0, at) + `${line}\n` + text.slice(at)
}

function appendExport(text, line) {
  if (text.includes(line)) return text
  return `${text.trimEnd()}\n\n${line}\n`
}

if (!fs.existsSync(layoutFile)) {
  console.error('app/layout.tsx not found')
  process.exit(1)
}

let layout = fs.readFileSync(layoutFile, 'utf8')

if (/^\s*['"]use client['"];?/m.test(layout)) {
  console.error('Root layout is a Client Component; metadata cannot be patched safely.')
  process.exit(1)
}

if (/export\s+(async\s+)?function\s+generateMetadata|export\s+const\s+generateMetadata/.test(layout)) {
  console.error('Root layout already uses generateMetadata; refusing to overwrite dynamic metadata.')
  process.exit(1)
}

layout = addImport(
  layout,
  "import SiteStructuredData from './components/SiteStructuredData'",
)
layout = addImport(
  layout,
  "import { mergeRootMetadata } from './seo/site'",
)

if (!layout.includes('mergeRootMetadata(credonomicsBaseMetadata)')) {
  if (/export\s+const\s+metadata\b/.test(layout)) {
    layout = layout.replace(
      /export\s+const\s+metadata\b/,
      'const credonomicsBaseMetadata',
    )
    layout = appendExport(
      layout,
      'export const metadata = mergeRootMetadata(credonomicsBaseMetadata)',
    )
  } else {
    layout = appendExport(
      layout,
      'export const metadata = mergeRootMetadata()',
    )
  }
}

const alreadyHasIdentityGraph =
  layout.includes('application/ld+json') &&
  (
    layout.includes('organizationId') ||
    layout.includes('websiteId') ||
    layout.includes("'@type': 'Organization'") ||
    layout.includes('\"@type\":\"Organization\"')
  )

if (!layout.includes('<SiteStructuredData />') && !alreadyHasIdentityGraph) {
  const body = layout.match(/<body(?:\s[^>]*)?>/)
  if (!body || body.index === undefined) {
    console.error('Could not find <body> in app/layout.tsx')
    process.exit(1)
  }

  const at = body.index + body[0].length
  layout =
    layout.slice(0, at) +
    '\n        <SiteStructuredData />' +
    layout.slice(at)
} else if (alreadyHasIdentityGraph) {
  console.log('Existing Organization/WebSite JSON-LD detected; duplicate injection skipped.')
}

fs.writeFileSync(layoutFile, layout, 'utf8')
console.log('Root metadata + structured identity integration PASSED.')

if (!fs.existsSync(homeFile)) {
  console.log('Homepage file missing; homepage canonical skipped.')
  process.exit(0)
}

let home = fs.readFileSync(homeFile, 'utf8')

if (/^\s*['"]use client['"];?/m.test(home)) {
  console.log('Homepage is a Client Component; homepage canonical patch skipped safely.')
  process.exit(0)
}

if (/export\s+(async\s+)?function\s+generateMetadata|export\s+const\s+generateMetadata/.test(home)) {
  console.log('Homepage already has dynamic metadata; preserved.')
  process.exit(0)
}

home = addImport(
  home,
  "import { mergeHomeMetadata } from './seo/site'",
)

if (!home.includes('mergeHomeMetadata(credonomicsHomeBaseMetadata)')) {
  if (/export\s+const\s+metadata\b/.test(home)) {
    home = home.replace(
      /export\s+const\s+metadata\b/,
      'const credonomicsHomeBaseMetadata',
    )
    home = appendExport(
      home,
      'export const metadata = mergeHomeMetadata(credonomicsHomeBaseMetadata)',
    )
  } else {
    home = appendExport(
      home,
      'export const metadata = mergeHomeMetadata()',
    )
  }
}

fs.writeFileSync(homeFile, home, 'utf8')
console.log('Homepage canonical + brand metadata integration PASSED.')