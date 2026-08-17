import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const appRoot = path.join(root, 'app')

const errors = []
const warnings = []

const ignoredDirs = new Set([
  'node_modules',
  '.next',
  '.git',
  'ipo-backups',
  'mf-backups',
])

function walk(dir) {
  if (!fs.existsSync(dir)) return []

  const out = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue

    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }

  return out
}

function rel(file) {
  return path.relative(root, file).replaceAll('\\', '/')
}

function resolveRelativeImport(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier)

  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.css`,
    `${base}.module.css`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ]

  return candidates.some((candidate) => fs.existsSync(candidate))
}

function routeFromPage(pageFile) {
  const relative = path.relative(appRoot, pageFile).replaceAll('\\', '/')
  const directory = path.posix.dirname(relative)

  if (directory === '.') return '/'

  const parts = directory
    .split('/')
    .filter(Boolean)
    .filter((part) => !(part.startsWith('(') && part.endsWith(')')))

  return '/' + parts.join('/')
}

const files = walk(appRoot)
const codeFiles = files.filter((file) => /\.(tsx?|jsx?|css)$/.test(file))
const pageFiles = files.filter((file) => /[\\/]page\.tsx?$/.test(file))
const routes = pageFiles.map(routeFromPage)

function routeMatches(target) {
  if (target === '/') return routes.includes('/')

  for (const route of routes) {
    if (route === target) return true

    const segments = route.split('/').filter(Boolean)
    const targetSegments = target.split('/').filter(Boolean)

    if (segments.length !== targetSegments.length) continue

    let matches = true

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]

      if (segment.startsWith('[') && segment.endsWith(']')) continue
      if (segment !== targetSegments[i]) {
        matches = false
        break
      }
    }

    if (matches) return true
  }

  return false
}

for (const file of codeFiles) {
  const text = fs.readFileSync(file, 'utf8')
  const name = rel(file)

  if (/Ã¢(?:â‚¬|â€ |â€¡)|Ã‚(?:Â©|Â·)|ï¿½/.test(text)) {
    errors.push(`${name}: visible mojibake/encoding corruption remains`)
  }

  if (/>\s*CREDONOMICS\s*</.test(text)) {
    errors.push(`${name}: visible standalone wordmark is still written as CREDONOMICS`)
  }

  const importRegex =
    /(?:import|export)\s+(?:[\s\S]*?\sfrom\s*)?['"](\.{1,2}\/[^'"]+)['"]/g

  let importMatch
  while ((importMatch = importRegex.exec(text))) {
    if (!resolveRelativeImport(file, importMatch[1])) {
      errors.push(
        `${name}: missing relative import "${importMatch[1]}"`,
      )
    }
  }

  if (/target=["']_blank["']/.test(text) && !/rel=["'][^"']*(?:noreferrer|noopener)/.test(text)) {
    warnings.push(
      `${name}: target="_blank" exists without an obvious noopener/noreferrer`,
    )
  }

  const imgTags = text.match(/<img\b[^>]*>/g) ?? []

  for (const tag of imgTags) {
    if (!/\balt=/.test(tag)) {
      warnings.push(`${name}: <img> without alt attribute`)
    }
  }

  if (/lorem ipsum/i.test(text)) {
    warnings.push(`${name}: placeholder Lorem Ipsum text found`)
  }

  const hrefRegex = /\bhref=["'](\/[^"'?#]*)["']/g
  let hrefMatch

  while ((hrefMatch = hrefRegex.exec(text))) {
    const target = hrefMatch[1].replace(/\/+$/, '') || '/'

    if (
      target.startsWith('/api/') ||
      /\.[a-z0-9]{2,5}$/i.test(target)
    ) {
      const publicFile = path.join(root, 'public', target.slice(1))

      if (/\.[a-z0-9]{2,5}$/i.test(target) && !fs.existsSync(publicFile)) {
        warnings.push(`${name}: public asset link may be missing: ${target}`)
      }

      continue
    }

    if (!routeMatches(target)) {
      warnings.push(`${name}: internal href does not match a discovered page route: ${target}`)
    }
  }
}

const layout = path.join(appRoot, 'layout.tsx')
if (!fs.existsSync(layout)) {
  errors.push('app/layout.tsx is missing')
}

const robots = path.join(appRoot, 'robots.ts')
if (!fs.existsSync(robots)) {
  warnings.push('app/robots.ts is missing')
}

const sitemap = path.join(appRoot, 'sitemap.ts')
if (!fs.existsSync(sitemap)) {
  warnings.push('app/sitemap.ts is missing')
}

console.log('')
console.log('CredoNomics Site Quality Audit')
console.log('==============================')
console.log(`Routes discovered: ${routes.length}`)
console.log(`Source files checked: ${codeFiles.length}`)
console.log(`Errors: ${errors.length}`)
console.log(`Warnings: ${warnings.length}`)

if (warnings.length) {
  console.log('')
  console.log('Warnings:')
  for (const warning of warnings) console.log(`  - ${warning}`)
}

if (errors.length) {
  console.log('')
  console.error('Errors:')
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log('')
console.log('Quality gate PASSED.')