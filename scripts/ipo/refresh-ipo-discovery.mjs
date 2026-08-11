import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const sourceUrl = 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=3&smid=10&ssid=15'
const outputJson = path.join(root, 'public', 'data', 'ipo', 'discovery.json')
const outputTs = path.join(root, 'app', 'data', 'ipo-discovery.generated.ts')
const now = new Date().toISOString()

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
  return decodeHtml(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function slugify(value = '') {
  return value.toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

function stageFromTitle(title = '') {
  const lower = title.toLowerCase()
  if (lower.includes('corrigendum')) return 'corrigendum'
  if (lower.includes('addendum')) return 'addendum'
  if (/\brhp\b/.test(lower) || lower.includes('red herring')) return 'rhp'
  if (/\bdrhp\b/.test(lower) || lower.includes('draft red herring')) return 'drhp'
  if (lower.includes('prospectus')) return 'prospectus'
  return 'other'
}

function companyFromTitle(title = '') {
  return title
    .replace(/\s*[-–—]\s*(addendum|corrigendum).*$/i, '')
    .replace(/\s*[-–—]\s*(draft\s+)?abridged\s+prospectus.*$/i, '')
    .replace(/\s*[-–—]\s*(drhp|rhp|prospectus).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDateNear(html, index) {
  const before = stripTags(html.slice(Math.max(0, index - 500), index))
  const matches = [...before.matchAll(/\b([A-Z][a-z]{2})\s+(\d{1,2}),\s+(20\d{2})\b/g)]
  const match = matches[matches.length - 1]
  if (!match) return ''
  const month = {
    Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',
    Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'
  }[match[1]]
  return month ? `${match[3]}-${month}-${String(match[2]).padStart(2,'0')}` : ''
}

function loadPrevious() {
  try {
    const parsed = JSON.parse(fs.readFileSync(outputJson, 'utf8'))
    return Array.isArray(parsed.records) ? parsed.records : []
  } catch {
    return []
  }
}

async function fetchHtml() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch(sourceUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; CredoNomicsIPOResearch/1.0; +https://www.credonomics.in)',
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

function parseFilings(html) {
  const records = []
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match

  while ((match = anchorRegex.exec(html)) !== null) {
    const href = decodeHtml(match[1]).trim()
    const title = stripTags(match[2])

    if (!title || title.length < 5) continue
    if (!/(DRHP|RHP|Prospectus|Addendum|Corrigendum|Red Herring)/i.test(title)) continue
    if (/abridged\s+prospectus/i.test(title)) continue

    let url
    try { url = new URL(href, sourceUrl).toString() } catch { continue }

    if (!url.includes('sebi.gov.in')) continue

    const stage = stageFromTitle(title)
    const companyName = companyFromTitle(title)
    if (!companyName || companyName.length < 3) continue

    const filingDate = parseDateNear(html, match.index)
    const idBase = `${companyName}|${stage}|${filingDate || title}`
    const id = `${slugify(companyName)}-${stage}-${crypto.createHash('sha1').update(idBase).digest('hex').slice(0,6)}`

    records.push({
      id,
      companyName,
      filingTitle: title,
      filingDate,
      documentStage: stage,
      documentUrl: url,
      sourceUrl,
      firstSeen: now,
      lastSeen: now,
    })
  }

  const seen = new Set()
  return records.filter((record) => {
    const key = `${record.companyName.toLowerCase()}|${record.documentStage}|${record.filingDate}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function mergeRecords(fresh, previous) {
  const map = new Map()

  for (const record of previous) {
    const key = `${record.companyName?.toLowerCase()}|${record.documentStage}|${record.filingDate}`
    map.set(key, record)
  }

  for (const record of fresh) {
    const key = `${record.companyName.toLowerCase()}|${record.documentStage}|${record.filingDate}`
    const old = map.get(key)
    map.set(key, {
      ...old,
      ...record,
      firstSeen: old?.firstSeen || record.firstSeen,
      lastSeen: now,
    })
  }

  return [...map.values()]
    .sort((a, b) => String(b.filingDate || '').localeCompare(String(a.filingDate || '')))
    .slice(0, 180)
}

function write(records) {
  const meta = {
    generatedAt: now,
    source: 'SEBI Public Issues',
    sourceUrl,
    recordCount: records.length,
    note: 'Discovery layer only. Financial ranking requires separately normalized offer-document data.',
  }

  fs.mkdirSync(path.dirname(outputJson), { recursive: true })
  fs.writeFileSync(outputJson, JSON.stringify({ meta, records }, null, 2) + '\n', 'utf8')

  const ts = `// AUTO-GENERATED by scripts/ipo/refresh-ipo-discovery.mjs.
import type { IpoDiscoveryRecord } from './ipo-types'

export const ipoDiscoveryMeta = ${JSON.stringify(meta, null, 2)} as const

export const ipoDiscovery: IpoDiscoveryRecord[] = ${JSON.stringify(records, null, 2)}
`
  fs.writeFileSync(outputTs, ts, 'utf8')
}

async function main() {
  const previous = loadPrevious()
  console.log('CredoNomics IPO discovery: fetching official SEBI Public Issues filings...')

  try {
    const html = await fetchHtml()
    const fresh = parseFilings(html)
    console.log(`SEBI discovery parsed ${fresh.length} current filing record(s).`)
    if (fresh.length === 0) {
      console.warn('No current filing anchors were parsed; preserving previous discovery records.')
      write(previous)
      return
    }
    const merged = mergeRecords(fresh, previous)
    write(merged)
    console.log(`IPO discovery catalogue now contains ${merged.length} record(s).`)
  } catch (error) {
    console.warn(`SEBI discovery refresh failed: ${error?.message || error}`)
    console.warn('Preserving the last known discovery catalogue.')
    write(previous)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
