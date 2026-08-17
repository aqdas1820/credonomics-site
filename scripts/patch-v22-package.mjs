import fs from 'node:fs'
import path from 'node:path'

const file = path.join(process.cwd(), 'package.json')
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'))

pkg.scripts ||= {}

const generator = 'node scripts/generate-ipo-dashboard.mjs'
const existing =
  typeof pkg.scripts.prebuild === 'string'
    ? pkg.scripts.prebuild.trim()
    : ''

if (!existing) {
  pkg.scripts.prebuild = generator
} else if (!existing.includes('scripts/generate-ipo-dashboard.mjs')) {
  pkg.scripts.prebuild = `${generator} && ${existing}`
}

pkg.scripts['ipo:refresh'] =
  'python scripts/ipo_auto_fetch/fetch_ipo_intelligence.py'
pkg.scripts['ipo:generate'] =
  'node scripts/generate-ipo-dashboard.mjs'

fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')

console.log(`prebuild: ${pkg.scripts.prebuild}`)
console.log(`ipo:refresh: ${pkg.scripts['ipo:refresh']}`)