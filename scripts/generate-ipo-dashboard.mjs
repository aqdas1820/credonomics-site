import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const appRoot = path.join(root, 'app')
const output = path.join(appRoot, 'data', 'ipo-dashboard.generated.ts')

const sourceCandidates = [
  'app/data/ipo-public.ts',
  'app/ipo/ipo-public.ts',
  'app/ipo/page.tsx',
  'app/ipo/IPOHubClient.tsx',
]

function read(relative) {
  const file = path.join(root, relative)
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
}

function clean(value = '') {
  return String(value)
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function literal(chunk, keys) {
  for (const key of keys) {
    const stringPattern = new RegExp(
      `${key}\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`,
      'i',
    )
    const stringMatch = stringPattern.exec(chunk)

    if (stringMatch?.[2]) return clean(stringMatch[2])

    const numberPattern = new RegExp(
      `${key}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`,
      'i',
    )
    const numberMatch = numberPattern.exec(chunk)

    if (numberMatch?.[1]) return numberMatch[1]
  }

  return ''
}

function numericPair(chunk, keys) {
  for (const key of keys) {
    const pairPattern = new RegExp(
      `${key}\\s*:\\s*\\[\\s*([\\d,.]+)\\s*,\\s*([\\d,.]+)\\s*\\]`,
      'i',
    )
    const pair = pairPattern.exec(chunk)

    if (pair) return `â‚¹${pair[1]} â€“ â‚¹${pair[2]}`
  }

  return ''
}

function normalizeDate(value) {
  if (!value) return ''

  const trimmed = value.trim()

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10)
  }

  const parsed = Date.parse(trimmed)
  if (Number.isNaN(parsed)) return trimmed

  return new Date(parsed).toISOString().slice(0, 10)
}

function displayDate(value) {
  if (!value) return ''

  const normalized = normalizeDate(value)
  const parsed = Date.parse(normalized)

  if (Number.isNaN(parsed)) return value

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(parsed))
}

function classifyBoard(value) {
  const text = value.toLowerCase()

  if (text.includes('sme')) return 'SME'
  if (text.includes('main')) return 'Mainboard'

  return 'Mainboard'
}

function dateStatus(openDate, closeDate, listingDate, explicitStatus) {
  const explicit = explicitStatus.toLowerCase()

  if (explicit.includes('open')) return 'Open'
  if (explicit.includes('upcoming')) return 'Upcoming'
  if (explicit.includes('close')) return 'Closed'
  if (explicit.includes('listed')) return 'Listed'

  const today = new Date()
  const indiaDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(today)

  const open = normalizeDate(openDate)
  const close = normalizeDate(closeDate)
  const listing = normalizeDate(listingDate)

  if (open && close && indiaDate >= open && indiaDate <= close) return 'Open'
  if (open && indiaDate < open) return 'Upcoming'
  if (listing && indiaDate >= listing) return 'Listed'
  if (close && indiaDate > close) return 'Closed'

  return explicitStatus || 'Research'
}

function parseSource(text, sourceName) {
  const slugMatches = [
    ...text.matchAll(/slug\s*:\s*(['"])([^'"]+)\1/g),
  ]

  const entries = []

  for (let index = 0; index < slugMatches.length; index++) {
    const match = slugMatches[index]
    const slug = match[2]
    const start = match.index ?? 0
    const end =
      index + 1 < slugMatches.length
        ? slugMatches[index + 1].index ?? text.length
        : Math.min(text.length, start + 9000)

    const chunk = text.slice(start, end)

    const company =
      literal(chunk, [
        'companyName',
        'issuerName',
        'company',
        'name',
        'title',
      ]) || slug.replace(/-ipo$/i, '').replaceAll('-', ' ')

    const boardRaw = literal(chunk, [
      'board',
      'segment',
      'issueType',
      'market',
      'category',
      'type',
    ])

    const openDate = literal(chunk, [
      'openDate',
      'openingDate',
      'issueOpenDate',
      'open',
    ])

    const closeDate = literal(chunk, [
      'closeDate',
      'closingDate',
      'issueCloseDate',
      'close',
    ])

    const listingDate = literal(chunk, [
      'listingDate',
      'listDate',
      'expectedListingDate',
    ])

    const allotmentDate = literal(chunk, [
      'allotmentDate',
      'basisOfAllotmentDate',
      'basisDate',
    ])

    const explicitStatus = literal(chunk, ['status', 'issueStatus'])

    let priceBand = literal(chunk, [
      'priceBand',
      'priceRange',
      'issuePrice',
      'price',
    ])

    if (!priceBand) {
      priceBand = numericPair(chunk, ['priceBand', 'priceRange'])
    }

    const lotSize = literal(chunk, [
      'lotSize',
      'minimumLot',
      'minLotSize',
      'marketLot',
    ])

    const issueSize = literal(chunk, [
      'issueSize',
      'totalIssueSize',
      'issueAmount',
      'freshIssueSize',
    ])

    const exchange = literal(chunk, [
      'exchange',
      'exchanges',
      'listingAt',
    ])

    const gmp = literal(chunk, [
      'gmp',
      'greyMarketPremium',
      'greyMarket',
    ])

    const subscription = literal(chunk, [
      'subscription',
      'subscriptionTimes',
      'totalSubscription',
    ])

    entries.push({
      id: `ipo:${slug}`,
      slug,
      company: clean(company),
      board: classifyBoard(boardRaw),
      status: dateStatus(
        openDate,
        closeDate,
        listingDate,
        explicitStatus,
      ),
      openDate: displayDate(openDate),
      closeDate: displayDate(closeDate),
      listingDate: displayDate(listingDate),
      allotmentDate: displayDate(allotmentDate),
      priceBand: clean(priceBand),
      lotSize: clean(lotSize),
      issueSize: clean(issueSize),
      exchange: clean(exchange),
      gmp: clean(gmp),
      subscription: clean(subscription),
      href: `/ipo/${slug}`,
      sourceFile: sourceName,
    })
  }

  return entries
}

let records = []

for (const source of sourceCandidates) {
  const text = read(source)
  if (!text) continue

  const parsed = parseSource(text, source)

  if (parsed.length > records.length) {
    records = parsed
  }
}

const deduped = new Map()

for (const record of records) {
  if (!record.slug || !record.company) continue

  const current = deduped.get(record.slug)

  if (!current) {
    deduped.set(record.slug, record)
    continue
  }

  const currentCompleteness = Object.values(current).filter(Boolean).length
  const nextCompleteness = Object.values(record).filter(Boolean).length

  if (nextCompleteness > currentCompleteness) {
    deduped.set(record.slug, record)
  }
}

records = [...deduped.values()]

const order = {
  Open: 0,
  Upcoming: 1,
  Closed: 2,
  Listed: 3,
  Research: 4,
}

records.sort((a, b) => {
  const statusDiff = (order[a.status] ?? 9) - (order[b.status] ?? 9)
  if (statusDiff) return statusDiff

  return a.company.localeCompare(b.company)
})

const routeMap = [
  ['Current IPOs', '/ipo/current', 'current'],
  ['Upcoming IPOs', '/ipo/upcoming', 'upcoming'],
  ['IPO Calendar', '/ipo/calendar', 'calendar'],
  ['Subscription', '/ipo/subscription', 'subscription'],
  ['Mainboard', '/ipo/mainboard', 'mainboard'],
  ['SME IPOs', '/ipo/sme', 'sme'],
  ['IPO Analyzer', '/ipo/analyzer', 'analyzer'],
  ['Documents', '/ipo/documents', 'documents'],
  ['Methodology', '/ipo/methodology', 'methodology'],
]

const navigation = routeMap
  .filter(([, href]) => {
    const segment = href.split('/').filter(Boolean).at(-1)
    return fs.existsSync(path.join(appRoot, 'ipo', segment, 'page.tsx'))
  })
  .map(([label, href, key]) => ({ label, href, key }))

const generated = `export type IPODashboardRecord = {
  id: string
  slug: string
  company: string
  board: 'Mainboard' | 'SME'
  status: string
  openDate: string
  closeDate: string
  listingDate: string
  allotmentDate: string
  priceBand: string
  lotSize: string
  issueSize: string
  exchange: string
  gmp: string
  subscription: string
  href: string
  sourceFile: string
}

export type IPONavigationItem = {
  label: string
  href: string
  key: string
}

export const ipoDashboardRecords: readonly IPODashboardRecord[] =
  ${JSON.stringify(records, null, 2)}

export const ipoNavigation: readonly IPONavigationItem[] =
  ${JSON.stringify(navigation, null, 2)}
`

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, generated, 'utf8')

console.log(`Generated ${records.length} normalized IPO dashboard records.`)
console.log(`Generated ${navigation.length} verified IPO utility links.`)

if (!navigation.length) {
  console.error('No existing IPO utility routes were discovered.')
  process.exit(1)
}