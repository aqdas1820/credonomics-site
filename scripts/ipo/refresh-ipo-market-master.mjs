import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const outputJson = path.join(root, 'public', 'data', 'ipo', 'market-master.json')
const outputTs = path.join(root, 'app', 'data', 'ipo-market-master.generated.ts')

const NSE_HOME = 'https://www.nseindia.com/'
const NSE_PAGE = 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo'
const NSE_API = 'https://www.nseindia.com/api/ipo-current-issue'
const BSE_MAINBOARD = 'https://www.bseindia.com/markets/PublicIssues/IPOIssues_new.aspx?id=1&Type=p'
const BSE_SME = 'https://www.bsesme.com/PublicIssues/PublicIssues.aspx?id=2'

const now = new Date()
const nowIso = now.toISOString()

function slugify(value = '') {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\blimited\b/g, ' ltd ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function decodeHtml(value = '') {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCodePoint(Number(n)) } catch { return ' ' }
    })
}

function stripTags(value = '') {
  return decodeHtml(
    String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' '),
  ).replace(/\s+/g, ' ').trim()
}

function num(value) {
  if (value === null || value === undefined || value === '') return undefined
  const cleaned = String(value).replace(/[₹,\s]/g, '').replace(/x$/i, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : undefined
}

const monthMap = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

function isoDate(value) {
  if (!value) return undefined
  const text = String(value).trim()

  let m = text.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{4})$/)
  if (m) {
    const month = monthMap[m[2].toLowerCase()]
    return month ? `${m[3]}-${month}-${m[1].padStart(2,'0')}` : undefined
  }

  m = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`

  m = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return text

  return undefined
}

function parsePrice(value) {
  if (value === null || value === undefined) return {}
  const matches = String(value)
    .replace(/,/g, '')
    .match(/\d+(?:\.\d+)?/g)
  if (!matches?.length) return {}
  const nums = matches.map(Number).filter(Number.isFinite)
  if (!nums.length) return {}
  if (nums.length === 1) return { low: nums[0], high: nums[0] }
  return { low: Math.min(...nums), high: Math.max(...nums) }
}

function segmentFrom(value = '') {
  const upper = String(value).toUpperCase()
  if (upper.includes('SME') || upper.includes('EMERGE')) return 'sme'
  if (upper.includes('EQ') || upper.includes('EQUITY') || upper.includes('MAIN')) return 'mainboard'
  return 'unknown'
}

function lifecycle(start, end, rawStatus = '') {
  const today = new Date()
  today.setHours(0,0,0,0)
  const s = start ? new Date(`${start}T00:00:00`) : null
  const e = end ? new Date(`${end}T23:59:59`) : null
  const status = String(rawStatus).toLowerCase()

  if (status.includes('withdraw')) return 'withdrawn'
  if (s && s > today) return 'upcoming'
  if (e && e < today) return 'closed'
  if (s && e && s <= today && e >= today) return 'open'
  if (status.includes('active') || status.includes('open')) return 'open'
  if (status.includes('forthcoming') || status.includes('upcoming')) return 'upcoming'
  if (status.includes('closed')) return 'closed'
  return 'unknown'
}

function first(row, keys) {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key]
  }
  return undefined
}

function normalizedName(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/\blimited\b/g, 'ltd')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sourceId(company, source, start) {
  return crypto.createHash('sha1').update(`${normalizedName(company)}|${source}|${start || ''}`).digest('hex').slice(0, 7)
}

function loadPrevious() {
  try {
    const data = JSON.parse(fs.readFileSync(outputJson, 'utf8'))
    return Array.isArray(data.records) ? data.records : []
  } catch {
    return []
  }
}

async function fetchWithTimeout(url, options = {}, timeout = 20000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' })
  } finally {
    clearTimeout(timer)
  }
}

function cookieHeader(response) {
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie().map((cookie) => cookie.split(';')[0]).join('; ')
  }
  const single = response.headers.get('set-cookie')
  return single ? single.split(',').map((cookie) => cookie.split(';')[0]).join('; ') : ''
}

async function getNseSession() {
  const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'en-IN,en;q=0.9',
  }
  const response = await fetchWithTimeout(NSE_PAGE, { headers })
  if (!response.ok) throw new Error(`NSE session HTTP ${response.status}`)
  await response.text()
  return { headers, cookie: cookieHeader(response) }
}

async function fetchNseApi() {
  const session = await getNseSession()
  const headers = {
    ...session.headers,
    accept: 'application/json,text/plain,*/*',
    referer: NSE_PAGE,
    cookie: session.cookie,
  }
  const response = await fetchWithTimeout(NSE_API, { headers })
  if (!response.ok) throw new Error(`NSE IPO API HTTP ${response.status}`)
  const data = await response.json()
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
}

function nseRecord(row) {
  const companyName = String(first(row, ['companyName','company','name']) || '').trim()
  if (!companyName) return null

  const symbol = String(first(row, ['symbol','issueSymbol','tradingSymbol']) || '').trim() || undefined
  const securityType = String(first(row, ['securityType','series','securitytype','type']) || '').trim()
  const openDate = isoDate(first(row, ['issueStartDate','startDate','issueOpenDate','openDate']))
  const closeDate = isoDate(first(row, ['issueEndDate','endDate','issueCloseDate','closeDate']))
  const status = lifecycle(openDate, closeDate, first(row, ['status','issueStatus']))
  const marketSegment = segmentFrom(securityType)
  const price = parsePrice(first(row, ['issuePrice','priceBand','priceRange','price']))
  const sharesOffered = num(first(row, ['noOfSharesOffered','noOfsharesOffered','sharesOffered','offered']))
  const sharesBid = num(first(row, ['noOfsharesBid','noOfSharesBid','sharesBid','bids']))
  const totalSubscription = num(first(row, ['noOfTime','subscription','subscriptionTimes','times']))
  const issueInfoUrl = symbol
    ? `https://www.nseindia.com/market-data/issue-information?series=${marketSegment === 'sme' ? 'SME' : 'EQ'}&symbol=${encodeURIComponent(symbol)}&type=Active`
    : NSE_PAGE

  const estimatedIssueValueCr =
    sharesOffered !== undefined && price.high !== undefined
      ? Number(((sharesOffered * price.high) / 10000000).toFixed(2))
      : undefined

  return {
    slug: `${slugify(companyName)}-${sourceId(companyName,'nse',openDate)}`,
    companyName,
    symbol,
    marketSegment,
    status,
    securityType,
    issue: {
      priceBandLow: price.low,
      priceBandHigh: price.high,
      openDate,
      closeDate,
      exchange: ['NSE'],
    },
    subscription: totalSubscription !== undefined
      ? { total: totalSubscription, updatedAt: nowIso, sourceUrl: issueInfoUrl }
      : undefined,
    sharesOffered,
    sharesBid,
    estimatedIssueValueCr,
    marketSource: 'NSE',
    sourceUrl: NSE_PAGE,
    issueInfoUrl,
    fetchedAt: nowIso,
  }
}

function parseTableRows(html) {
  const rows = []
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const cells = []
    const cellRegex = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi
    let cellMatch
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(stripTags(cellMatch[1]))
    }
    if (cells.length >= 4) rows.push(cells)
  }
  return rows
}

async function fetchNseHtmlFallback() {
  const response = await fetchWithTimeout(NSE_PAGE, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
      'accept-language': 'en-IN,en;q=0.9',
    },
  })
  if (!response.ok) throw new Error(`NSE page HTTP ${response.status}`)
  const html = await response.text()
  const rows = parseTableRows(html)
  const records = []

  for (const cells of rows) {
    const joined = cells.join(' | ')
    if (!/\d{1,2}[-/][A-Za-z]{3}[-/]\d{4}/.test(joined) && !/\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(joined)) continue
    const companyName = cells[0]?.trim()
    if (!companyName || /company name/i.test(companyName)) continue
    const securityType = cells[1] || ''
    const openDate = isoDate(cells[2])
    const closeDate = isoDate(cells[3])
    const rawStatus = cells[4] || ''
    const sharesOffered = num(cells[5])
    const sharesBid = num(cells[6])
    const totalSubscription = num(cells[7])

    records.push({
      slug: `${slugify(companyName)}-${sourceId(companyName,'nse-html',openDate)}`,
      companyName,
      marketSegment: segmentFrom(securityType),
      status: lifecycle(openDate, closeDate, rawStatus),
      securityType,
      issue: { openDate, closeDate, exchange: ['NSE'] },
      subscription: totalSubscription !== undefined
        ? { total: totalSubscription, updatedAt: nowIso, sourceUrl: NSE_PAGE }
        : undefined,
      sharesOffered,
      sharesBid,
      marketSource: 'NSE',
      sourceUrl: NSE_PAGE,
      fetchedAt: nowIso,
    })
  }
  return records
}

function bseRowsToRecords(rows, segment) {
  const records = []
  for (const cells of rows) {
    // BSE SME historical format:
    // Company | Start | End | Offer Price | Face Value | Type
    if (cells.length < 5) continue
    const companyName = cells[0]?.trim()
    const openDate = isoDate(cells[1])
    const closeDate = isoDate(cells[2])
    if (!companyName || !openDate || !closeDate || /scrip name/i.test(companyName)) continue

    const type = cells[cells.length - 1] || ''
    if (/takeover|rights|\bri\b|reits?/i.test(type)) continue

    const price = parsePrice(cells[3])
    const faceValue = num(cells[4])
    const status = lifecycle(openDate, closeDate, '')

    // Retain only a useful live window: recently closed, current or future.
    const close = new Date(`${closeDate}T23:59:59`)
    const daysOld = (now.getTime() - close.getTime()) / 86400000
    if (daysOld > 45) continue

    records.push({
      slug: `${slugify(companyName)}-${sourceId(companyName,'bse',openDate)}`,
      companyName,
      marketSegment: segment,
      status,
      securityType: segment === 'sme' ? 'SME' : 'EQ',
      issue: {
        priceBandLow: price.low,
        priceBandHigh: price.high,
        faceValue,
        openDate,
        closeDate,
        exchange: ['BSE'],
      },
      marketSource: 'BSE',
      sourceUrl: segment === 'sme' ? BSE_SME : BSE_MAINBOARD,
      fetchedAt: nowIso,
    })
  }
  return records
}

async function fetchBse(url, segment) {
  const response = await fetchWithTimeout(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
      accept: 'text/html,application/xhtml+xml',
      'accept-language': 'en-IN,en;q=0.9',
      referer: 'https://www.bseindia.com/',
    },
  })
  if (!response.ok) throw new Error(`BSE ${segment} HTTP ${response.status}`)
  const html = await response.text()
  return bseRowsToRecords(parseTableRows(html), segment)
}

function merge(records) {
  const map = new Map()

  for (const record of records) {
    const key = normalizedName(record.companyName)
    const old = map.get(key)
    if (!old) {
      map.set(key, record)
      continue
    }

    const sources = new Set([...(old.issue.exchange || []), ...(record.issue.exchange || [])])
    const preferNse = old.marketSource.includes('NSE') ? old : record.marketSource.includes('NSE') ? record : old
    const other = preferNse === old ? record : old

    map.set(key, {
      ...other,
      ...preferNse,
      slug: old.slug || record.slug,
      marketSegment:
        preferNse.marketSegment !== 'unknown'
          ? preferNse.marketSegment
          : other.marketSegment,
      status:
        preferNse.status !== 'unknown'
          ? preferNse.status
          : other.status,
      issue: {
        ...other.issue,
        ...preferNse.issue,
        priceBandLow: preferNse.issue.priceBandLow ?? other.issue.priceBandLow,
        priceBandHigh: preferNse.issue.priceBandHigh ?? other.issue.priceBandHigh,
        faceValue: preferNse.issue.faceValue ?? other.issue.faceValue,
        openDate: preferNse.issue.openDate || other.issue.openDate,
        closeDate: preferNse.issue.closeDate || other.issue.closeDate,
        exchange: [...sources],
      },
      subscription: preferNse.subscription || other.subscription,
      marketSource:
        old.marketSource !== record.marketSource ? 'NSE+BSE' : old.marketSource,
    })
  }

  return [...map.values()].sort((a, b) => {
    const order = { open: 0, upcoming: 1, closed: 2, unknown: 3, listed: 4, draft: 5, withdrawn: 6 }
    return (order[a.status] ?? 9) - (order[b.status] ?? 9) ||
      String(a.issue.openDate || '').localeCompare(String(b.issue.openDate || '')) ||
      a.companyName.localeCompare(b.companyName)
  })
}

function write(records, sourceStatus) {
  const meta = {
    generatedAt: nowIso,
    recordCount: records.length,
    nseCount: records.filter((record) => record.marketSource.includes('NSE')).length,
    bseCount: records.filter((record) => record.marketSource.includes('BSE')).length,
    activeCount: records.filter((record) => record.status === 'open').length,
    upcomingCount: records.filter((record) => record.status === 'upcoming').length,
    sourceStatus,
  }

  fs.mkdirSync(path.dirname(outputJson), { recursive: true })
  fs.writeFileSync(outputJson, JSON.stringify({ meta, records }, null, 2) + '\n', 'utf8')

  const ts = `// AUTO-GENERATED by scripts/ipo/refresh-ipo-market-master.mjs.
// Exchange-market layer: issue status/dates/price/subscription. Not a fundamental score.

import type { IpoMarketRecord } from './ipo-types'

export const ipoMarketMasterMeta = ${JSON.stringify(meta, null, 2)} as const

export const ipoMarketMaster: IpoMarketRecord[] = ${JSON.stringify(records, null, 2)}
`
  fs.writeFileSync(outputTs, ts, 'utf8')

  console.log(`IPO market master: ${records.length} record(s)`)
  console.log(`  Open: ${meta.activeCount}`)
  console.log(`  Upcoming: ${meta.upcomingCount}`)
  console.log(`  NSE-backed: ${meta.nseCount}`)
  console.log(`  BSE-backed: ${meta.bseCount}`)
  console.log(`  Source status: ${sourceStatus}`)
}

async function refresh() {
  const previous = loadPrevious()
  const records = []
  const statuses = []

  console.log('Fetching official NSE current/upcoming public-issue data...')
  try {
    const rows = await fetchNseApi()
    const parsed = rows.map(nseRecord).filter(Boolean)
    records.push(...parsed)
    statuses.push(`NSE API ${parsed.length}`)
    console.log(`NSE API: ${parsed.length} record(s)`)
  } catch (error) {
    console.warn(`NSE API failed: ${error?.message || error}`)
    try {
      const parsed = await fetchNseHtmlFallback()
      records.push(...parsed)
      statuses.push(`NSE HTML ${parsed.length}`)
      console.log(`NSE HTML fallback: ${parsed.length} record(s)`)
    } catch (fallbackError) {
      console.warn(`NSE HTML fallback failed: ${fallbackError?.message || fallbackError}`)
      statuses.push('NSE unavailable')
    }
  }

  console.log('Fetching official BSE SME public-issue data...')
  try {
    const parsed = await fetchBse(BSE_SME, 'sme')
    records.push(...parsed)
    statuses.push(`BSE SME ${parsed.length}`)
    console.log(`BSE SME: ${parsed.length} recent/current record(s)`)
  } catch (error) {
    console.warn(`BSE SME failed: ${error?.message || error}`)
    statuses.push('BSE SME unavailable')
  }

  console.log('Fetching official BSE mainboard public-issue data...')
  try {
    const parsed = await fetchBse(BSE_MAINBOARD, 'mainboard')
    records.push(...parsed)
    statuses.push(`BSE mainboard ${parsed.length}`)
    console.log(`BSE mainboard: ${parsed.length} recent/current record(s)`)
  } catch (error) {
    console.warn(`BSE mainboard failed: ${error?.message || error}`)
    statuses.push('BSE mainboard unavailable')
  }

  const merged = merge(records)

  if (merged.length === 0 && previous.length > 0) {
    console.warn('No fresh exchange rows could be parsed. Preserving last-known market master.')
    write(previous, `${statuses.join(' · ')} · preserved previous`)
    return
  }

  write(merged, statuses.join(' · '))
}

function selfTest() {
  const sample = [
    {
      symbol: 'SAMPLE',
      companyName: 'Sample Industries Limited',
      securityType: 'EQ',
      issueStartDate: '11-Aug-2026',
      issueEndDate: '13-Aug-2026',
      status: 'Active',
      issuePrice: '125 to 132',
      noOfSharesOffered: '1,00,00,000',
      noOfsharesBid: '2,50,00,000',
      noOfTime: '2.50',
    },
    {
      symbol: 'SMPLSME',
      companyName: 'Sample SME Limited',
      securityType: 'SME',
      issueStartDate: '20-Aug-2026',
      issueEndDate: '24-Aug-2026',
      status: 'Forthcoming',
      issuePrice: '90-95',
    },
  ]

  const parsed = sample.map(nseRecord).filter(Boolean)
  if (parsed.length !== 2) throw new Error('self-test record count')
  if (parsed[0].marketSegment !== 'mainboard') throw new Error('self-test mainboard')
  if (parsed[1].marketSegment !== 'sme') throw new Error('self-test SME')
  if (parsed[0].issue.priceBandHigh !== 132) throw new Error('self-test price')
  if (parsed[0].subscription?.total !== 2.5) throw new Error('self-test subscription')
  console.log('IPO market-master parser self-test passed.')
}

if (process.argv.includes('--self-test')) {
  selfTest()
} else {
  refresh().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
