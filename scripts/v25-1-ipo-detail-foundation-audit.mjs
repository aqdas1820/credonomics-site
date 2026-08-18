import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const required = {
  normalizer: path.join(
    root,
    'app',
    'ipo',
    'lib',
    'ipo-detail-normalizer.ts',
  ),
  indexApi: path.join(
    root,
    'app',
    'api',
    'ipo-details',
    'route.ts',
  ),
  detailApi: path.join(
    root,
    'app',
    'api',
    'ipo-details',
    '[slug]',
    'route.ts',
  ),
}

const errors = []

for (const [name, file] of Object.entries(
  required,
)) {
  if (!fs.existsSync(file)) {
    errors.push(`Missing ${name}: ${file}`)
  }
}

if (!errors.length) {
  const normalizer = fs.readFileSync(
    required.normalizer,
    'utf8',
  )
  const indexApi = fs.readFileSync(
    required.indexApi,
    'utf8',
  )
  const detailApi = fs.readFileSync(
    required.detailApi,
    'utf8',
  )

  for (const marker of [
    'ipoDashboardRecords',
    'normalizeIpoRecord',
    'getIpoDetailBySlug',
    'getIpoDetailIndex',
    'completenessPercent',
    'minimumInvestment',
    'freshIssue',
    'offerForSale',
    'subscription',
    'promoters',
    'normalizeSources',
  ]) {
    if (!normalizer.includes(marker)) {
      errors.push(
        `Normalizer missing marker: ${marker}`,
      )
    }
  }

  for (const marker of [
    'getIpoDetailIndex',
    'Cache-Control',
  ]) {
    if (!indexApi.includes(marker)) {
      errors.push(
        `Index API missing marker: ${marker}`,
      )
    }
  }

  for (const marker of [
    'getIpoDetailBySlug',
    'IPO not found',
    'status: 404',
    'Cache-Control',
  ]) {
    if (!detailApi.includes(marker)) {
      errors.push(
        `Detail API missing marker: ${marker}`,
      )
    }
  }

  if (
    normalizer.includes('Math.random') ||
    normalizer.includes('mock') ||
    normalizer.includes('fabricat')
  ) {
    errors.push(
      'Normalizer contains prohibited fabricated-data logic',
    )
  }
}

console.log('')
console.log(
  'CredoNomics V25.1 IPO Detail Foundation Audit',
)
console.log(
  '============================================',
)
console.log(`Errors: ${errors.length}`)

if (errors.length) {
  console.log('')

  for (const error of errors) {
    console.error(`- ${error}`)
  }

  process.exit(1)
}

console.log(
  'V25.1 IPO detail data foundation audit PASSED.',
)