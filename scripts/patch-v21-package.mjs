import fs from 'node:fs'
import path from 'node:path'

const file = path.join(process.cwd(), 'package.json')
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'))

pkg.scripts ||= {}

const command = 'node scripts/generate-ipo-dashboard.mjs'
const existing =
  typeof pkg.scripts.prebuild === 'string'
    ? pkg.scripts.prebuild.trim()
    : ''

if (!existing) {
  pkg.scripts.prebuild = command
} else if (!existing.includes('scripts/generate-ipo-dashboard.mjs')) {
  pkg.scripts.prebuild = `${command} && ${existing}`
}

fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')

console.log(`prebuild: ${pkg.scripts.prebuild}`)

if (!pkg.scripts.prebuild.includes('scripts/generate-ipo-dashboard.mjs')) {
  console.error('IPO dashboard generator was not attached to prebuild.')
  process.exit(1)
}