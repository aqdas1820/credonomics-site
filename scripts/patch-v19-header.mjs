import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const header = path.join(root, 'app', 'components', 'SiteHeader.tsx')

if (!fs.existsSync(header)) {
  console.error('app/components/SiteHeader.tsx is required for V19.')
  process.exit(1)
}

let text = fs.readFileSync(header, 'utf8')

if (!text.includes("from './SiteSearch'") && !text.includes('from "./SiteSearch"')) {
  const importAnchor =
    text.match(/^import .*ThemeModeToggle.*$/m)?.[0] ||
    text.match(/^import .*$/m)?.[0]

  if (!importAnchor) {
    console.error('Could not locate SiteHeader import anchor.')
    process.exit(1)
  }

  text = text.replace(
    importAnchor,
    `${importAnchor}\nimport SiteSearch from './SiteSearch'`,
  )
}

if (!text.includes('<SiteSearch />')) {
  const actionsClass =
    /<div\s+className=\{styles\.globalHeaderActions\}>/

  const match = text.match(actionsClass)

  if (!match) {
    console.error('Could not locate shared globalHeaderActions in SiteHeader.')
    process.exit(1)
  }

  text = text.replace(
    match[0],
    `${match[0]}\n            <SiteSearch />`,
  )
}

fs.writeFileSync(header, text, 'utf8')

if ((text.match(/<SiteSearch \/>/g) ?? []).length !== 1) {
  console.error('Expected exactly one SiteSearch in shared header.')
  process.exit(1)
}

console.log('Shared header search integration PASSED.')