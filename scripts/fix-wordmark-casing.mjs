import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const appRoot = path.join(root, 'app')
const ignored = new Set(['node_modules', '.next', '.git', 'data'])
const extensions = new Set(['.tsx', '.ts', '.jsx', '.js'])

function walk(dir) {
  if (!fs.existsSync(dir)) return []

  const output = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue

    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) output.push(...walk(full))
    else if (extensions.has(path.extname(entry.name))) output.push(full)
  }

  return output
}

const files = walk(appRoot)
let changedFiles = 0
let replacements = 0

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8')
  let after = before

  // Exact standalone JSX/HTML text node. This is intentionally the same
  // pattern used by the quality audit so repair and validation cannot disagree.
  after = after.replace(/>\s*CREDONOMICS\s*</g, (match) => {
    replacements += 1
    const leading = match.match(/^>\s*/)?.[0] ?? '>'
    const trailing = match.match(/\s*<$/)?.[0] ?? '<'
    return `${leading}CredoNomics${trailing}`
  })

  // Catch standalone string literals only; do not rewrite compound labels such
  // as "CREDONOMICS INTELLIGENCE".
  after = after.replace(/(["'])CREDONOMICS\1/g, (_match, quote) => {
    replacements += 1
    return `${quote}CredoNomics${quote}`
  })

  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8')
    changedFiles += 1
    console.log(`  FIXED: ${path.relative(root, file).replaceAll('\\\\', '/')}`)
  }
}

console.log(`Wordmark files corrected: ${changedFiles}`)
console.log(`Standalone wordmark replacements: ${replacements}`)

// Hard verification using the exact audit pattern.
const remaining = []

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')

  if (/>\s*CREDONOMICS\s*</.test(text)) {
    remaining.push(path.relative(root, file).replaceAll('\\\\', '/'))
  }
}

if (remaining.length) {
  console.error('Standalone CREDONOMICS still remains in:')
  for (const file of remaining) console.error(`  - ${file}`)
  process.exit(1)
}

console.log('Standalone wordmark verification PASSED.')