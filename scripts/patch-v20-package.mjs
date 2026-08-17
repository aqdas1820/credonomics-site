import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const packageFile = path.join(root, 'package.json')

const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'))
pkg.scripts ||= {}

const generator = 'node scripts/generate-search-index.mjs'
const existing = typeof pkg.scripts.prebuild === 'string'
  ? pkg.scripts.prebuild.trim()
  : ''

if (!existing) {
  pkg.scripts.prebuild = generator
} else if (!existing.includes('scripts/generate-search-index.mjs')) {
  pkg.scripts.prebuild = `${generator} && ${existing}`
}

fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')

console.log(`prebuild: ${pkg.scripts.prebuild}`)

if (!pkg.scripts.prebuild.includes('scripts/generate-search-index.mjs')) {
  console.error('Search index generator was not attached to prebuild.')
  process.exit(1)
}