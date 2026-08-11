import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'public', 'data', 'ipo', 'verified')
const files = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((name) => name.endsWith('.json') && !name.startsWith('_'))
  : []

let failed = false

const allowedSegment = new Set(['mainboard', 'sme', 'unknown'])
const allowedStatus = new Set(['draft', 'upcoming', 'open', 'closed', 'listed', 'withdrawn', 'unknown'])

for (const file of files) {
  const full = path.join(dir, file)
  let record
  try {
    record = JSON.parse(fs.readFileSync(full, 'utf8'))
  } catch {
    console.error(`FAIL ${file}: invalid JSON`)
    failed = true
    continue
  }

  const errors = []
  for (const field of ['slug', 'companyName', 'marketSegment', 'status', 'lastVerified']) {
    if (!record[field]) errors.push(`missing ${field}`)
  }

  if (!allowedSegment.has(record.marketSegment)) errors.push('invalid marketSegment')
  if (!allowedStatus.has(record.status)) errors.push('invalid status')
  if (!record.issue || typeof record.issue !== 'object') errors.push('issue object required')
  if (!Array.isArray(record.financials) || record.financials.length === 0) errors.push('at least one financial period required')
  if (!Array.isArray(record.sources) || record.sources.length === 0) errors.push('at least one official/source document required')

  for (const source of record.sources || []) {
    if (!source.url?.startsWith('https://')) errors.push('source URL must use https://')
    if (!source.checkedAt) errors.push('source checkedAt required')
  }

  if (errors.length) {
    failed = true
    console.error(`FAIL ${file}: ${errors.join('; ')}`)
  } else {
    console.log(`OK   ${file}`)
  }
}

if (files.length === 0) {
  console.log('No normalized production IPO records found yet. Template excluded. Validation passed.')
}

if (failed) process.exit(1)
console.log('IPO normalized-data validation passed.')
