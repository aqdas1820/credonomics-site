import fs from 'node:fs'
import path from 'node:path'

const dir = path.join(process.cwd(), 'public', 'data', 'cards')
const files = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((name) => name.endsWith('.json') && !name.startsWith('_'))
  : []

let failed = false

for (const file of files) {
  const full = path.join(dir, file)
  let data
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'))
  } catch (error) {
    console.error(`FAIL ${file}: invalid JSON`)
    failed = true
    continue
  }

  const errors = []
  for (const field of ['slug', 'issuer', 'productName', 'lastVerified']) {
    if (!data[field] || typeof data[field] !== 'string') errors.push(`missing ${field}`)
  }

  if (data.status !== 'verified') errors.push('status must be "verified" before production publishing')
  if (!Array.isArray(data.officialSources) || data.officialSources.length === 0) {
    errors.push('at least one official source is required')
  } else {
    data.officialSources.forEach((source, index) => {
      if (!source?.url?.startsWith('https://')) errors.push(`officialSources[${index}].url must be https://`)
      if (!source?.checkedAt) errors.push(`officialSources[${index}].checkedAt is required`)
    })
  }

  if (errors.length) {
    failed = true
    console.error(`FAIL ${file}: ${errors.join('; ')}`)
  } else {
    console.log(`OK   ${file}`)
  }
}

if (files.length === 0) {
  console.log('No production card JSON records found. Template excluded. Validation passed.')
}

if (failed) process.exit(1)
