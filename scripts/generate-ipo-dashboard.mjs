import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const appRoot = path.join(root, 'app')
const autoFile = path.join(
  root,
  'public',
  'data',
  'ipo-intelligence',
  'index.json',
)
const outputFile = path.join(
  appRoot,
  'data',
  'ipo-dashboard.generated.ts',
)

function clean(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function board(value = '') {
  return clean(value).toLowerCase().includes('sme')
    ? 'SME'
    : 'Mainboard'
}

function readAuto() {
  if (!fs.existsSync(autoFile)) return null

  try {
    return JSON.parse(fs.readFileSync(autoFile, 'utf8'))
  } catch {
    return null
  }
}

function routeExists(href) {
  const segment = href.split('/').filter(Boolean).at(-1)
  return fs.existsSync(path.join(appRoot, 'ipo', segment, 'page.tsx'))
}

const data = readAuto()
const autoIssues = Array.isArray(data?.issues) ? data.issues : []

const records = autoIssues.map((issue) => ({
  id: `auto:${issue.slug}`,
  slug: issue.slug,
  company: clean(issue.company),
  board: board(issue.board),
  status: clean(issue.status) || 'Research',
  openDate: clean(issue.openDate),
  closeDate: clean(issue.closeDate),
  listingDate: clean(issue.listingDate),
  allotmentDate: clean(issue.allotmentDate),
  priceBand: clean(issue.priceBand || issue.issuePrice),
  lotSize: clean(issue.lotSize),
  issueSize: clean(issue.issueSize),
  exchange: clean(issue.exchange),
  gmp: '',
  subscription: clean(issue.subscription),
  href: `/ipo/company/${issue.slug}`,
  sourceFile: 'public/data/ipo-intelligence/index.json',
  prospectusUrl: clean(issue.prospectusUrl),
  financialExtractionStatus: clean(issue.financialExtractionStatus),
}))

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
  .filter(([, href]) => routeExists(href))
  .map(([label, href, key]) => ({ label, href, key }))

const source = `export type IPODashboardRecord = {
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
  prospectusUrl: string
  financialExtractionStatus: string
}

export type IPONavigationItem = {
  label: string
  href: string
  key: string
}

export const ipoDashboardMeta = ${JSON.stringify(
  {
    generatedAt: data?.generatedAt ?? '',
    sourceHealth: data?.sourceHealth ?? {},
    warnings: data?.warnings ?? [],
    automated: Boolean(autoIssues.length),
  },
  null,
  2,
)}

export const ipoDashboardRecords: readonly IPODashboardRecord[] =
  ${JSON.stringify(records, null, 2)}

export const ipoNavigation: readonly IPONavigationItem[] =
  ${JSON.stringify(navigation, null, 2)}
`

fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, source, 'utf8')

console.log(
  `Generated ${records.length} automated IPO dashboard records.`,
)

if (!records.length) {
  console.error(
    'No automated IPO data exists. Run the Python IPO fetcher first.',
  )
  process.exit(1)
}