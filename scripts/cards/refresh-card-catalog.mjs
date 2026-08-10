import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { issuerSources } from './issuer-sources.mjs'

const ROOT = process.cwd()
const OUTPUT_JSON = path.join(ROOT, 'public', 'data', 'cards', 'auto-catalog.json')
const OUTPUT_TS = path.join(ROOT, 'app', 'data', 'auto-card-catalog.generated.ts')
const REQUEST_TIMEOUT_MS = 18000
const MAX_DETAIL_FETCHES_PER_ISSUER = 12
const MAX_RECORDS = 260

const categoryKeywords = {
  cashback: ['cashback', 'cash back', 'value back'],
  fuel: ['fuel', 'petrol', 'diesel', 'indianoil', 'iocl', 'bpcl', 'hpcl', 'surcharge waiver'],
  travel: ['travel', 'airline', 'flight', 'hotel', 'miles', 'air miles', 'airport', 'lounge', 'indigo', 'vistara', 'air india', 'cleartrip', 'makemytrip', 'goibibo'],
  shopping: ['shopping', 'online', 'flipkart', 'amazon', 'myntra', 'shopping rewards'],
  grocery: ['grocery', 'groceries', 'supermarket', 'bigbasket', 'blinkit'],
  dining: ['dining', 'restaurant', 'swiggy', 'zomato', 'eazydiner', 'food'],
  utilities: ['utility', 'utilities', 'electricity', 'broadband', 'mobile recharge', 'dth', 'bill payment'],
  upi: ['upi', 'rupay', 'credit card on upi'],
  forex: ['forex', 'foreign currency', 'international spend', 'international transaction', 'markup', 'mark-up'],
  lounge: ['lounge', 'airport lounge', 'dreamfolks'],
  premium: ['premium', 'elite', 'reserve', 'magnus', 'marquee', 'private', 'infinite', 'metal', 'concierge', 'golf'],
  business: ['business card', 'business credit', 'corporate card', 'commercial card'],
  'lifetime-free': ['lifetime free', 'life time free', 'no annual fee', 'annual fee: nil', 'annual fee nil'],
  beginner: ['secured', 'easy credit', 'entry', 'starter', 'beginner', 'against fixed deposit', 'fd backed'],
  'low-fee': ['annual fee', 'renewal fee'],
  'co-branded': [
    'co-branded', 'cobrand', 'co branded', 'amazon', 'flipkart', 'tata', 'indigo', 'air india',
    'vistara', 'spicejet', 'indianoil', 'iocl', 'bpcl', 'hpcl', 'airtel', 'samsung', 'lic',
    'phonepe', 'paytm', 'swiggy', 'makemytrip', 'marriott', 'shoppers stop', 'freecharge',
  ],
}

const genericHeadingReject = [
  'credit cards', 'credit card', 'apply for credit card', 'best credit card',
  'compare credit cards', 'credit card faq', 'credit card offers', 'card finder',
  'featured cards', 'all cards', 'our credit cards', 'find the card',
]

function decodeHtml(value = '') {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#8377;|&\#x20b9;/gi, '₹')
    .replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCodePoint(Number(n)) } catch { return ' ' }
    })
}

function stripTags(html = '') {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normaliseName(value = '') {
  return stripTags(value)
    .replace(/\s+/g, ' ')
    .replace(/\s+(apply now|know more|learn more).*$/i, '')
    .trim()
}

function looksLikeProductName(name) {
  const lower = name.toLowerCase().trim()
  if (!lower || name.length < 5 || name.length > 110) return false
  if (!lower.includes('card')) return false
  if (genericHeadingReject.some((generic) => lower === generic)) return false
  if (/^(how|why|what|when|where)\b/.test(lower)) return false
  if (/(faq|offers|eligibility|services|fees & charges|how to apply|learning hub)/i.test(lower)) return false
  return true
}

function parseIndianMoney(raw) {
  if (!raw) return undefined
  const clean = raw.toLowerCase().replace(/,/g, '').replace(/₹|rs\.?|inr/g, '').trim()
  if (/^(nil|zero|free|0)$/.test(clean)) return 0
  const match = clean.match(/(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|k|thousand)?/)
  if (!match) return undefined
  let value = Number(match[1])
  if (!Number.isFinite(value)) return undefined
  const unit = match[2]
  if (unit === 'crore' || unit === 'cr') value *= 10000000
  if (unit === 'lakh' || unit === 'lac') value *= 100000
  if (unit === 'k' || unit === 'thousand') value *= 1000
  return Math.round(value)
}

function findMoneyAfterLabel(text, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const patterns = [
      new RegExp(`${escaped}\\s*[:\\-]?\\s*(?:₹|rs\\.?|inr)?\\s*([\\d,.]+\\s*(?:lakh|lac|crore|cr|k|thousand)?|nil|free)`, 'i'),
      new RegExp(`${escaped}[\\s\\S]{0,55}?(?:₹|rs\\.?|inr)\\s*([\\d,.]+\\s*(?:lakh|lac|crore|cr|k|thousand)?)`, 'i'),
    ]
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        const parsed = parseIndianMoney(match[1])
        if (parsed !== undefined) return parsed
      }
    }
  }
  return undefined
}

function findFeeWaiver(text) {
  const patterns = [
    /(?:waiv(?:ed|er)|reversal)[\s\S]{0,100}?(?:annual\s+spends?|spends?)[\s\S]{0,35}?(?:₹|rs\.?|inr)?\s*([\d,.]+\s*(?:lakh|lac|crore|cr|k|thousand)?)/i,
    /(?:annual\s+spends?|spends?)[\s\S]{0,55}?(?:₹|rs\.?|inr)?\s*([\d,.]+\s*(?:lakh|lac|crore|cr|k|thousand)?)[\s\S]{0,65}?waiv/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const parsed = parseIndianMoney(match[1])
      if (parsed !== undefined) return parsed
    }
  }
  return undefined
}

function percentageContexts(text) {
  const results = []
  const regex = /(\d+(?:\.\d+)?)\s*%/g
  let match
  while ((match = regex.exec(text)) !== null) {
    const value = Number(match[1])
    if (!Number.isFinite(value) || value > 100) continue
    const start = Math.max(0, match.index - 90)
    const end = Math.min(text.length, match.index + match[0].length + 110)
    results.push({
      value,
      context: text.slice(start, end).replace(/\s+/g, ' ').trim(),
    })
  }
  return results
}

function maxPercentNear(percentages, words) {
  const candidates = percentages
    .filter((entry) => words.some((word) => entry.context.toLowerCase().includes(word)))
    .map((entry) => entry.value)
    .filter((value) => value >= 0 && value <= 60)
  return candidates.length ? Math.max(...candidates) : undefined
}

function minPercentNear(percentages, words) {
  const candidates = percentages
    .filter((entry) => words.some((word) => entry.context.toLowerCase().includes(word)))
    .map((entry) => entry.value)
    .filter((value) => value >= 0 && value <= 10)
  return candidates.length ? Math.min(...candidates) : undefined
}

function loungeInfo(text) {
  const lower = text.toLowerCase()
  const unlimited = /unlimited[\s\S]{0,45}lounge|lounge[\s\S]{0,45}unlimited/i.test(text)
  if (unlimited) return { unlimited: true, visits: 99 }

  const patterns = [
    /(\d+)\s+(?:complimentary\s+)?(?:domestic|international)?\s*(?:airport\s+)?lounge\s+(?:access|visits?)/i,
    /(?:lounge\s+(?:access|visits?))[\s\S]{0,45}?(\d+)\s*(?:times?|visits?)?/i,
    /(\d+)\s+(?:complimentary\s+)?(?:airport\s+)?lounge/i,
  ]
  let best = 0
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) best = Math.max(best, Number(match[1]) || 0)
  }
  if (!best && lower.includes('lounge')) best = 1
  return { unlimited: false, visits: best || undefined }
}

function keywordCount(text, words) {
  const lower = text.toLowerCase()
  return words.reduce((sum, word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const count = (lower.match(new RegExp(escaped, 'g')) || []).length
    return sum + Math.min(count, 4)
  }, 0)
}

function detectBenefits(text) {
  const lines = text
    .split(/\n|•|\u2022/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length >= 20 && line.length <= 220)

  const benefitWords = [
    'cashback', 'reward', 'lounge', 'fuel', 'surcharge', 'forex', 'foreign',
    'dining', 'grocery', 'shopping', 'travel', 'miles', 'welcome', 'milestone',
    'utility', 'upi', 'fee waiver', 'annual fee',
  ]

  const selected = []
  for (const line of lines) {
    if (!benefitWords.some((word) => line.toLowerCase().includes(word))) continue
    if (selected.some((existing) => existing.toLowerCase() === line.toLowerCase())) continue
    selected.push(line)
    if (selected.length >= 5) break
  }
  return selected
}

function findProductUrl(blockHtml, baseUrl, allowedHosts) {
  const anchors = [...blockHtml.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
  for (const anchor of anchors) {
    const href = decodeHtml(anchor[1]).trim()
    try {
      const resolved = new URL(href, baseUrl)
      if (!allowedHosts.includes(resolved.hostname)) continue
      const lower = resolved.pathname.toLowerCase()
      if (/(apply|login|track|faq|offer|terms|privacy|contact)/.test(lower)) continue
      if (/(credit|card)/.test(lower)) return resolved.toString()
    } catch {}
  }
  return baseUrl
}

function scoreCategories(record, text) {
  const scores = {}
  const annualFee = record.annualFee ?? record.renewalFee
  const lower = text.toLowerCase()

  for (const [category, words] of Object.entries(categoryKeywords)) {
    scores[category] = keywordCount(text, words) * 4
  }

  const add = (category, value) => { scores[category] = (scores[category] || 0) + (Number.isFinite(value) ? value : 0) }

  add('cashback', (record.maxCashbackRate || 0) * 8)
  add('fuel', (record.fuelRate || 0) * 9 + (record.surchargeWaiverRate || 0) * 6)
  add('shopping', (record.shoppingRate || record.maxCashbackRate || 0) * 7)
  add('grocery', (record.groceryRate || 0) * 9)
  add('dining', (record.diningRate || 0) * 9)
  add('utilities', (record.utilityRate || 0) * 10)
  add('upi', (record.upiRate || 0) * 10)
  add('travel', (record.travelRate || 0) * 7 + (record.loungeVisits || 0) * 1.5)
  add('lounge', (record.loungeUnlimited ? 45 : Math.min(record.loungeVisits || 0, 12) * 4))
  add('forex', record.forexMarkup !== undefined ? Math.max(0, 35 - record.forexMarkup * 8) : 0)
  add('forex', (record.foreignRewardRate || 0) * 7)
  add('premium', annualFee && annualFee >= 3000 ? 20 : 0)
  add('premium', record.loungeUnlimited ? 25 : Math.min(record.loungeVisits || 0, 12))
  add('business', /\bbusiness\b|\bcorporate\b|\bcommercial\b/i.test(text) ? 35 : 0)
  add('co-branded', categoryKeywords['co-branded'].some((word) => lower.includes(word)) ? 28 : 0)

  if (annualFee === 0 || /lifetime\s+free|life\s*time\s+free/i.test(text)) add('lifetime-free', 55)
  if (annualFee !== undefined && annualFee <= 1000) add('low-fee', 30 - annualFee / 60)
  if (annualFee !== undefined && annualFee <= 500) add('beginner', 22)
  if (/secured|fixed deposit|\bfd\b|easy credit/i.test(text)) add('beginner', 35)

  // Minimum relevance threshold prevents generic cards from appearing everywhere.
  for (const key of Object.keys(scores)) {
    if (scores[key] < 8) scores[key] = 0
    scores[key] = Number(scores[key].toFixed(2))
  }
  return scores
}

function buildRecord({ issuer, catalogueUrl, name, blockHtml, detailHtml, sourceUrl, fetchedAt }) {
  const html = detailHtml || blockHtml
  const text = stripTags(html)
  const percentages = percentageContexts(text)

  const annualFee = findMoneyAfterLabel(text, ['annual fee', 'renewal fee'])
  const joiningFee = findMoneyAfterLabel(text, ['joining fee', 'one-time fee'])
  const renewalFee = findMoneyAfterLabel(text, ['renewal fee', 'annual fee'])
  const feeWaiverSpend = findFeeWaiver(text)

  const maxCashbackRate = maxPercentNear(percentages, ['cashback', 'cash back', 'value back'])
  const maxRewardRate = maxPercentNear(percentages, ['reward', 'rewards', 'points', 'value back'])
  const fuelRate = maxPercentNear(percentages, ['fuel', 'petrol', 'indianoil', 'iocl', 'bpcl', 'hpcl'])
  const surchargeWaiverRate = maxPercentNear(percentages, ['surcharge waiver', 'fuel surcharge'])
  const shoppingRate = maxPercentNear(percentages, ['shopping', 'online', 'flipkart', 'amazon', 'myntra'])
  const groceryRate = maxPercentNear(percentages, ['grocery', 'groceries', 'supermarket', 'bigbasket', 'blinkit'])
  const diningRate = maxPercentNear(percentages, ['dining', 'restaurant', 'swiggy', 'zomato', 'eazydiner'])
  const utilityRate = maxPercentNear(percentages, ['utility', 'utilities', 'electricity', 'recharge', 'broadband', 'dth'])
  const travelRate = maxPercentNear(percentages, ['travel', 'flight', 'hotel', 'airline', 'miles'])
  const upiRate = maxPercentNear(percentages, ['upi', 'rupay'])
  const foreignRewardRate = maxPercentNear(percentages, ['foreign spend', 'international spend', 'foreign currency'])
  const forexMarkup = minPercentNear(percentages, ['forex markup', 'foreign currency markup', 'foreign currency mark-up', 'forex mark-up'])
  const lounge = loungeInfo(text)

  const provisional = {
    annualFee,
    joiningFee,
    renewalFee,
    feeWaiverSpend,
    maxCashbackRate,
    maxRewardRate,
    fuelRate,
    surchargeWaiverRate,
    shoppingRate,
    groceryRate,
    diningRate,
    utilityRate,
    travelRate,
    upiRate,
    foreignRewardRate,
    forexMarkup,
    loungeVisits: lounge.visits,
    loungeUnlimited: lounge.unlimited,
  }

  const categoryScores = scoreCategories(provisional, text)
  const categories = Object.entries(categoryScores).filter(([, score]) => score > 0).map(([category]) => category)

  const completeness = [
    annualFee !== undefined || renewalFee !== undefined,
    percentages.length > 0,
    categories.length >= 2,
    sourceUrl !== catalogueUrl,
    feeWaiverSpend !== undefined || lounge.visits !== undefined || forexMarkup !== undefined,
  ].filter(Boolean).length

  const confidence = completeness >= 4 ? 'high' : completeness >= 2 ? 'medium' : 'low'

  const id = crypto.createHash('sha1').update(`${issuer}|${name}`).digest('hex').slice(0, 14)

  return {
    id,
    issuer,
    name,
    sourceUrl,
    catalogueUrl,
    fetchedAt,
    confidence,
    ...Object.fromEntries(Object.entries(provisional).filter(([, value]) => value !== undefined && value !== false)),
    categories,
    categoryScores,
    detectedBenefits: detectBenefits(text),
    detectedPercentages: percentages.slice(0, 10),
  }
}

function extractHeadingBlocks(html, source) {
  const blocks = []
  const regex = /<h([2-5])[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[2-5][^>]*>|$)/gi
  let match

  while ((match = regex.exec(html)) !== null) {
    const name = normaliseName(match[2])
    if (!looksLikeProductName(name)) continue

    const blockHtml = `${match[0]}`
    const sourceUrl = findProductUrl(blockHtml, source.url, source.hosts)
    blocks.push({ name, blockHtml, sourceUrl })
  }

  // Some issuer catalogues use div-based product cards. Recover obvious named card labels.
  if (blocks.length < 4) {
    const text = stripTags(html)
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index]
      if (!looksLikeProductName(line)) continue
      if (blocks.some((item) => item.name.toLowerCase() === line.toLowerCase())) continue
      const context = lines.slice(index, index + 14).join('\n')
      blocks.push({ name: line, blockHtml: context, sourceUrl: source.url })
      if (blocks.length >= 55) break
    }
  }

  // Dedupe and avoid enormous generic catalogues.
  const seen = new Set()
  return blocks.filter((block) => {
    const key = block.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 55)
}

async function fetchText(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; CredoNomicsResearchBot/1.0; +https://www.credonomics.in)',
        'accept-language': 'en-IN,en;q=0.9',
        accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.text()
  } finally {
    clearTimeout(timer)
  }
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0
  async function runner() {
    while (true) {
      const index = cursor++
      if (index >= items.length) return
      try { results[index] = await worker(items[index], index) }
      catch (error) { results[index] = { error } }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner))
  return results
}

function loadPrevious() {
  try {
    const data = JSON.parse(fs.readFileSync(OUTPUT_JSON, 'utf8'))
    return Array.isArray(data.records) ? data.records : []
  } catch {
    return []
  }
}

async function scrapeIssuer(source, fetchedAt) {
  const html = await fetchText(source.url)
  const blocks = extractHeadingBlocks(html, source)
  const detailCandidates = blocks
    .filter((block) => block.sourceUrl !== source.url)
    .slice(0, MAX_DETAIL_FETCHES_PER_ISSUER)

  const detailMap = new Map()
  const details = await mapLimit(detailCandidates, 4, async (block) => {
    try {
      const detailHtml = await fetchText(block.sourceUrl)
      return { url: block.sourceUrl, html: detailHtml }
    } catch {
      return { url: block.sourceUrl, html: null }
    }
  })
  for (const result of details) {
    if (result?.url && result.html) detailMap.set(result.url, result.html)
  }

  const records = blocks.map((block) =>
    buildRecord({
      issuer: source.issuer,
      catalogueUrl: source.url,
      name: block.name,
      blockHtml: block.blockHtml,
      detailHtml: detailMap.get(block.sourceUrl),
      sourceUrl: block.sourceUrl,
      fetchedAt,
    }),
  )

  return records.filter((record) => record.categories.length > 0)
}

function dedupeRecords(records) {
  const map = new Map()
  for (const record of records) {
    const key = `${record.issuer}|${record.name}`.toLowerCase().replace(/[^a-z0-9|]/g, '')
    const existing = map.get(key)
    if (!existing) {
      map.set(key, record)
      continue
    }
    const confidenceWeight = { high: 3, medium: 2, low: 1 }
    const currentWeight = confidenceWeight[record.confidence] || 0
    const existingWeight = confidenceWeight[existing.confidence] || 0
    if (currentWeight > existingWeight) map.set(key, record)
  }
  return [...map.values()].slice(0, MAX_RECORDS)
}

function writeOutputs(records, meta) {
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.mkdirSync(path.dirname(OUTPUT_TS), { recursive: true })

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify({ meta, records }, null, 2) + '\n', 'utf8')

  const typeHeader = `// AUTO-GENERATED FILE.
// Refreshed by scripts/cards/refresh-card-catalog.mjs.
// Do not hand-edit product terms here.

export type AutoCardCatalogRecord = {
  id: string
  issuer: string
  name: string
  sourceUrl: string
  catalogueUrl: string
  fetchedAt: string
  confidence: 'high' | 'medium' | 'low'
  annualFee?: number
  joiningFee?: number
  renewalFee?: number
  feeWaiverSpend?: number
  maxCashbackRate?: number
  maxRewardRate?: number
  fuelRate?: number
  surchargeWaiverRate?: number
  shoppingRate?: number
  groceryRate?: number
  diningRate?: number
  utilityRate?: number
  travelRate?: number
  upiRate?: number
  foreignRewardRate?: number
  forexMarkup?: number
  loungeVisits?: number
  loungeUnlimited?: boolean
  categories: string[]
  categoryScores: Record<string, number>
  detectedBenefits: string[]
  detectedPercentages: Array<{ value: number; context: string }>
}

`

  const ts = `${typeHeader}export const autoCardCatalogMeta = ${JSON.stringify(meta, null, 2)} as const

export const autoCardCatalog: AutoCardCatalogRecord[] = ${JSON.stringify(records, null, 2)}
`
  fs.writeFileSync(OUTPUT_TS, ts, 'utf8')
}

async function main() {
  const fetchedAt = new Date().toISOString()
  const previous = loadPrevious()
  const successfulIssuers = new Set()
  const failedIssuers = new Set()
  const freshRecords = []

  console.log(`CredoNomics card catalogue refresh: ${issuerSources.length} official issuer sources`)

  const issuerResults = await mapLimit(issuerSources, 3, async (source) => {
    console.log(`Fetching ${source.issuer}: ${source.url}`)
    try {
      const records = await scrapeIssuer(source, fetchedAt)
      console.log(`  ${source.issuer}: ${records.length} candidate card records`)
      return { source, records }
    } catch (error) {
      console.warn(`  ${source.issuer}: failed (${error?.message || error})`)
      return { source, records: [], error: true }
    }
  })

  for (const result of issuerResults) {
    if (!result) continue
    if (result.error) {
      failedIssuers.add(result.source.issuer)
    } else {
      successfulIssuers.add(result.source.issuer)
      freshRecords.push(...result.records)
    }
  }

  // Preserve last known records for an issuer when its official site temporarily blocks/fails.
  const preserved = previous.filter((record) => failedIssuers.has(record.issuer))
  const records = dedupeRecords([...freshRecords, ...preserved])

  const meta = {
    generatedAt: fetchedAt,
    sourceCount: issuerSources.length,
    successfulSources: successfulIssuers.size,
    failedSources: failedIssuers.size,
    recordCount: records.length,
    failedIssuers: [...failedIssuers],
    note: 'Automatically extracted from official issuer catalogue/product pages. Verify source before acting.',
  }

  writeOutputs(records, meta)

  const categoryCounts = {}
  for (const record of records) {
    for (const category of record.categories) {
      if ((record.categoryScores?.[category] || 0) > 0) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }
    }
  }

  console.log(`Generated ${records.length} records.`)
  console.log('Category coverage:')
  for (const [category, count] of Object.entries(categoryCounts).sort()) {
    console.log(`  ${category}: ${count}`)
  }

  if (records.length === 0 && previous.length === 0) {
    console.warn('WARNING: No card records could be extracted. Site will show a refresh-pending state.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
