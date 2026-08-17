import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const appRoot = path.join(root, 'app')
const outputFile = path.join(appRoot, 'data', 'search-index.generated.ts')

const ignored = new Set([
  'node_modules',
  '.next',
  '.git',
  'api',
  '_components',
  'components',
])

function walk(dir) {
  if (!fs.existsSync(dir)) return []

  const result = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue

    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) result.push(...walk(full))
    else result.push(full)
  }

  return result
}

function routeFromPage(file) {
  const relative = path.relative(appRoot, file).replaceAll('\\', '/')
  const directory = path.posix.dirname(relative)

  if (directory === '.') return '/'

  const parts = directory
    .split('/')
    .filter(Boolean)
    .filter((part) => !(part.startsWith('(') && part.endsWith(')')))

  if (parts.some((part) => part.startsWith('['))) return null

  return '/' + parts.join('/')
}

function cleanText(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]+\}/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstQuotedProperty(text, property) {
  const pattern = new RegExp(
    `${property}\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`,
    'm',
  )
  return cleanText(pattern.exec(text)?.[2] ?? '')
}

function extractH1(text) {
  const match = text.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)
  return cleanText(match?.[1] ?? '')
}

function titleFromRoute(route) {
  if (route === '/') return 'CredoNomics Investment Solutions'

  return route
    .split('/')
    .filter(Boolean)
    .at(-1)
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function classify(route) {
  if (route === '/') return 'Platform'
  if (route === '/discover') return 'Discovery'
  if (route.startsWith('/reports')) return 'Reports'
  if (route.startsWith('/research')) return 'Research'
  if (route.startsWith('/ipo')) return 'IPO'
  if (route === '/mutual-funds') return 'Mutual Funds'
  if (route.startsWith('/tools/mf-portfolio-tracker')) return 'Mutual Funds'
  if (route.startsWith('/cards')) return 'Cards'
  if (route.startsWith('/tools')) return 'Tools'
  if (route.startsWith('/methodology')) return 'Methodology'
  if (route.startsWith('/about') || route.startsWith('/official')) return 'Company'
  return 'Platform'
}

function sourceFor(category) {
  switch (category) {
    case 'Reports':
      return 'CredoNomics publication'
    case 'Research':
      return 'Research Desk'
    case 'IPO':
      return 'IPO market records'
    case 'Mutual Funds':
      return 'Portfolio disclosures'
    case 'Cards':
      return 'Issuer terms'
    case 'Methodology':
      return 'Methodology'
    case 'Tools':
      return 'CredoNomics tools'
    default:
      return 'CredoNomics'
  }
}

function priorityFor(route, category) {
  if (route === '/') return 100
  if (route === '/discover') return 99
  if (route === '/reports') return 96
  if (route === '/research') return 95
  if (route === '/ipo') return 94
  if (route === '/mutual-funds') return 95
  if (route === '/tools/mf-portfolio-tracker') return 93
  if (route === '/cards') return 91
  if (route === '/tools') return 90
  if (category === 'Reports') return 88
  if (category === 'Research') return 86
  if (category === 'IPO') return 84
  if (category === 'Mutual Funds') return 82
  return 60
}

const entries = []
const pageFiles = walk(appRoot).filter((file) => /[\\/]page\.tsx?$/.test(file))

for (const pageFile of pageFiles) {
  const route = routeFromPage(pageFile)
  if (!route || route === '/search') continue

  const text = fs.readFileSync(pageFile, 'utf8')
  const metadataTitle = firstQuotedProperty(text, 'title')
  const h1 = extractH1(text)
  const title = metadataTitle || h1 || titleFromRoute(route)
  const description =
    firstQuotedProperty(text, 'description') ||
    `Explore ${title} on CredoNomics Investment Solutions.`

  const category = classify(route)

  entries.push({
    id: `route:${route}`,
    title,
    description,
    href: route,
    category,
    source: sourceFor(category),
    updated: '',
    keywords: `${route.replaceAll('/', ' ')} ${title} ${category}`,
    priority: priorityFor(route, category),
  })
}

function readIfExists(relative) {
  const file = path.join(root, relative)
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
}

function objectsFromText(text) {
  const objects = []
  const regex = /\{([\s\S]*?)\}/g
  let match

  while ((match = regex.exec(text))) {
    const block = match[1]
    if (/slug\s*:/.test(block)) objects.push(block)
  }

  return objects
}

function value(block, property) {
  const regex = new RegExp(`${property}\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`)
  return cleanText(regex.exec(block)?.[2] ?? '')
}

function addEnriched(relative, config) {
  const text = readIfExists(relative)
  if (!text) return

  for (const block of objectsFromText(text)) {
    const slug = value(block, 'slug')
    const title = value(block, config.titleKey)
    if (!slug || !title) continue

    const description =
      value(block, 'description') ||
      value(block, 'summary') ||
      config.fallbackDescription(title)

    const updated =
      value(block, config.updatedKey) ||
      value(block, 'reviewed') ||
      value(block, 'lastUpdated') ||
      value(block, 'issueDate') ||
      ''

    entries.push({
      id: `${config.prefix}:${slug}`,
      title: config.decorateTitle
        ? config.decorateTitle(title, block)
        : title,
      description,
      href: `${config.baseHref}/${slug}`,
      category: config.category,
      source: config.source,
      updated,
      keywords: `${title} ${slug} ${config.category} ${value(block, 'companyName')}`,
      priority: config.priority,
    })
  }
}

addEnriched('app/data/research-articles.ts', {
  prefix: 'article',
  titleKey: 'title',
  updatedKey: 'reviewed',
  baseHref: '/research/articles',
  category: 'Research',
  source: 'CredoNomics research',
  priority: 89,
  fallbackDescription: (title) => `CredoNomics research article: ${title}.`,
})

addEnriched('app/data/reports.ts', {
  prefix: 'report',
  titleKey: 'title',
  updatedKey: 'issueDate',
  baseHref: '/reports',
  category: 'Reports',
  source: 'CredoNomics publication',
  priority: 97,
  fallbackDescription: (title) => `CredoNomics research publication: ${title}.`,
  decorateTitle: (title, block) => {
    const edition = value(block, 'edition')
    return edition ? `${title} - ${edition}` : title
  },
})

const ipoText = readIfExists('app/data/ipo-public.ts')
if (ipoText) {
  for (const block of objectsFromText(ipoText)) {
    const slug = value(block, 'slug')
    const companyName = value(block, 'companyName') || value(block, 'name')

    if (!slug || !companyName) continue

    entries.push({
      id: `ipo:${slug}`,
      title: `${companyName} IPO`,
      description:
        value(block, 'description') ||
        `Open the CredoNomics IPO record for ${companyName}.`,
      href: `/ipo/${slug}`,
      category: 'IPO',
      source: 'IPO market record',
      updated: value(block, 'lastUpdated'),
      keywords: `${companyName} ${slug} IPO primary market`,
      priority: 87,
    })
  }
}

const deduped = new Map()

for (const entry of entries) {
  const key = entry.href.toLowerCase()
  const current = deduped.get(key)

  if (!current || entry.priority > current.priority) {
    deduped.set(key, entry)
  }
}

const finalEntries = [...deduped.values()]
  .sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title))
  .map((entry) => ({
    ...entry,
    description: entry.description.slice(0, 240),
    keywords: cleanText(entry.keywords),
  }))

const source = `export type SearchEntry = {
  id: string
  title: string
  description: string
  href: string
  category: string
  source: string
  updated: string
  keywords: string
  priority: number
}

export const searchIndex: readonly SearchEntry[] = ${JSON.stringify(finalEntries, null, 2)}
`

fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, source, 'utf8')

console.log(`Generated ${finalEntries.length} CredoNomics search entries.`)

if (finalEntries.length < 10) {
  console.error('Search index is unexpectedly small.')
  process.exit(1)
}