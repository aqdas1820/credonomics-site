import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(process.cwd(), 'public', 'data', 'cards')

const jsonFiles = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((name) => name.endsWith('.json') && !name.startsWith('_'))
  : []

const generatedSupportFiles = new Set([
  'auto-catalog.json',
  'review-queue.json',
  'verified-index.json',
])

let failed = false
let validated = 0
let skipped = 0

function looksLikeManualCardRecord(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false

  // Manual production card files use this schema. Generated/support JSON files
  // contain arrays such as records/items or metadata containers instead.
  return (
    Object.prototype.hasOwnProperty.call(data, 'slug') ||
    Object.prototype.hasOwnProperty.call(data, 'productName') ||
    Object.prototype.hasOwnProperty.call(data, 'officialSources') ||
    Object.prototype.hasOwnProperty.call(data, 'status')
  )
}

for (const file of jsonFiles) {
  const full = path.join(dir, file)

  if (generatedSupportFiles.has(file) || file.startsWith('auto-')) {
    console.log(`SKIP ${file}: generated/support data`)
    skipped += 1
    continue
  }

  let data
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'))
  } catch {
    console.error(`FAIL ${file}: invalid JSON`)
    failed = true
    continue
  }

  if (!looksLikeManualCardRecord(data)) {
    console.log(`SKIP ${file}: not a manual card-record schema`)
    skipped += 1
    continue
  }

  validated += 1
  const errors = []

  for (const field of ['slug', 'issuer', 'productName', 'lastVerified']) {
    if (!data[field] || typeof data[field] !== 'string') {
      errors.push(`missing ${field}`)
    }
  }

  if (data.status !== 'verified') {
    errors.push('status must be "verified" before production publishing')
  }

  if (!Array.isArray(data.officialSources) || data.officialSources.length === 0) {
    errors.push('at least one official source is required')
  } else {
    data.officialSources.forEach((source, index) => {
      if (!source?.url?.startsWith('https://')) {
        errors.push(`officialSources[${index}].url must be https://`)
      }
      if (!source?.checkedAt) {
        errors.push(`officialSources[${index}].checkedAt is required`)
      }
    })
  }

  if (errors.length) {
    failed = true
    console.error(`FAIL ${file}: ${errors.join('; ')}`)
  } else {
    console.log(`OK   ${file}`)
  }
}

if (validated === 0) {
  console.log('No manual production card JSON records found.')
}

console.log(`Validation summary: ${validated} manual record(s) checked; ${skipped} generated/support file(s) skipped.`)

if (failed) {
  process.exit(1)
}

console.log('Manual card-data validation passed.')
