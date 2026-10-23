import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const hash = value => crypto.createHash('sha256').update(value).digest('hex')
const baseline = 'f2f41546350dee37378b9119d0b2fd6bffe864d0'
const files = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(file)
    else if (entry.name === 'page.tsx') files.push(file)
  }
}
walk('app')
const route = file => '/' + file.replace(/^app\//, '').replace(/\/?page\.tsx$/, '')
const family = url => /^\/(account|auth|alerts|watchlist)(\/|$)/.test(url) ? 'Protected application boundary; unchanged'
  : /^\/cards/.test(url) ? 'Credit cards'
  : /^\/ipo/.test(url) ? 'IPO intelligence'
  : /mutual-funds|mf-portfolio/.test(url) ? 'Mutual funds'
  : /^\/(markets|stocks)/.test(url) ? 'Markets and instruments'
  : /^\/tools/.test(url) ? 'Calculators and decision tools'
  : /^\/(research|reports|updates)/.test(url) ? 'Research and publications'
  : /^\/(search|discover)/.test(url) ? 'Discovery and search'
  : 'Homepage / company / policy information'

const cards = fs.readFileSync('app/data/verified-real-cards.ts', 'utf8')
const cardIds = [...cards.matchAll(/id: '([^']+)'/g)].map(match => match[1])
const ledger = fs.readFileSync('app/data/research-updates.ts', 'utf8')
const reviewedIds = [...new Set([...ledger.matchAll(/cardId: '([^']+)'/g)].map(match => match[1]))]
const mf = read('public/data/mf-intelligence/v2/index.json')
const latest = read('public/data/mf-intelligence/v2/latest.json')
const instruments = read('public/data/equity/instruments.json')
const catalogue = read('public/data/cards/auto-catalog.json')
const ipo = read('public/data/ipo/market-master.json')
const filings = read('public/data/ipo/discovery.json')
const legacy = fs.readdirSync('public/data/mf-intelligence/v2/by-month').filter(file => file !== '2026-09.json').map(file => {
  const target = `public/data/mf-intelligence/v2/by-month/${file}`
  const previous = execFileSync('git', ['show', `HEAD:${target}`])
  return { month: file.replace('.json', ''), unchanged: hash(previous) === hash(fs.readFileSync(target)), sha256: hash(previous) }
})
if (legacy.some(row => !row.unchanged)) throw new Error('Historical snapshot was unexpectedly modified')
const audit = {
  edition: '2026-10', checkedAt: '2026-10-23', baselineCommit: baseline,
  scope: 'Public data and presentation only. Authentication, contributions, banking, security policies and financial records were not modified.',
  routePatterns: files.map(file => ({ route: route(file), source: file, family: family(route(file)) })).sort((a,b) => a.route.localeCompare(b.route)),
  dynamicCoverage: { creditCardRecords: cardIds.length, cardCategoryModels: 16, ipoMarketRecords: ipo.records.length, ipoDiscoveryRecords: filings.records.length,
    mutualFundSchemes: mf.counts.schemes, equityInstrumentRecords: instruments.counts.valid },
  cards: { originalFullRecordCheck: '2026-08-10', fieldReviewDate: '2026-10-23', reviewedFieldCardIds: reviewedIds,
    companionCorrections: ['sbi-miles-prime'], heldFromSomeRupeeRankings: ['first-power', 'indigo-axis', 'indigo-axis-premium'],
    fullRecordReverificationNotClaimed: true, remainingFullRecordReviewIds: cardIds.filter(id => !reviewedIds.includes(id)),
    catalogue: catalogue.meta, source: '/updates/2026-10',
    note: 'Issuer catalogue extraction is discovery evidence, not a validated financial ranking. Original per-card dates remain visible. Named field corrections do not certify every term.' },
  mutualFunds: { latestDisclosureMonth: mf.latestMonth, lastImport: mf.latestImport, latestNumericEquityPositions: latest.summary.holdings,
    historyQuality: mf.metadata.quality, legacySnapshots: legacy, sourceManifest: '/data/mf-intelligence/v2/official-sources-2026-09.json',
    limitation: 'Six HDFC schemes only. Numeric Indian equity weights only; sub-0.01% positions are unquantified in the source manifest. July/August unavailable. No unverified NAME-to-ISIN joins or inferred month-on-month trades.' },
  instruments: { source: instruments.source, generatedAt: instruments.generatedAt, counts: instruments.counts, sources: instruments.sources,
    limitation: 'Instrument identity refresh is separate from live quote availability. Uses the existing validator; no new completeness or asset-class certification is claimed.' },
  ipo: { market: ipo.meta, filings: filings.meta,
    limitation: 'Official exchange/filing refresh preserves source provenance. BSE/SME gaps remain explicit; filing records are not treated as confirmed issue calendars.' },
  researchAndReports: { priorPublication: 'August 2026', preserved: true, addedPublication: '/updates/2026-10',
    note: 'Historical publication and source dates retained; no new equity price targets or performance data invented.' },
  tools: { formulas: 'Existing calculators retained. Card reward-model corrections are separately tested and documented.', assumptions: 'User inputs; not automatically refreshed tax, fee or investment recommendations.' },
  informationalAndProtectedRoutes: { informational: 'Identity, policy and regulatory wording retained.', protected: 'Account, authentication, alerts, watchlist and payment integrations unchanged.' },
}
fs.mkdirSync('public/data/research-updates', { recursive: true })
fs.writeFileSync('public/data/research-updates/site-data-audit-2026-10.json', JSON.stringify(audit, null, 2) + '\n')
console.log(JSON.stringify({ routePatterns: files.length, cardRecords: cardIds.length, fieldReviews: reviewedIds.length,
  latestMfHoldings: latest.summary.holdings, legacySnapshotsPreserved: legacy.length, instruments: instruments.counts.valid }))
