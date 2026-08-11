import fs from 'node:fs'
import path from 'node:path'

const file = path.join(process.cwd(), 'public', 'data', 'ipo', 'market-master.json')

if (!fs.existsSync(file)) {
  console.error('FAIL market-master.json missing')
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'))
if (!data.meta || !Array.isArray(data.records)) {
  console.error('FAIL market-master.json invalid container')
  process.exit(1)
}

let failed = false
const seen = new Set()

for (const record of data.records) {
  const errors = []
  if (!record.slug) errors.push('missing slug')
  if (!record.companyName) errors.push('missing companyName')
  if (!['mainboard','sme','unknown'].includes(record.marketSegment)) errors.push('invalid marketSegment')
  if (!['draft','upcoming','open','closed','listed','withdrawn','unknown'].includes(record.status)) errors.push('invalid status')
  if (!record.issue || typeof record.issue !== 'object') errors.push('missing issue')
  if (!record.sourceUrl?.startsWith('https://')) errors.push('invalid sourceUrl')
  if (!record.fetchedAt) errors.push('missing fetchedAt')
  if (seen.has(record.slug)) errors.push('duplicate slug')
  seen.add(record.slug)

  if (errors.length) {
    failed = true
    console.error(`FAIL ${record.companyName || record.slug}: ${errors.join('; ')}`)
  }
}

if (failed) process.exit(1)
console.log(`IPO market-master validation passed: ${data.records.length} record(s).`)
