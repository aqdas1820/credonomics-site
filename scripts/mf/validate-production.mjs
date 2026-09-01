import fs from 'node:fs'
import path from 'node:path'
import { CORE_SCHEMES, ISIN_RE, MONTH_RE, classifySecurityName, stableHash, writeJson } from './pipeline-lib.mjs'

const targetArg = process.argv.find(value => value.startsWith('--target='))
const root = path.resolve(targetArg ? targetArg.slice(9) : 'data/mf-production-staging/v2')
const errors = []
const warnings = []
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
let index
try { index = read('index.json') } catch (error) { errors.push(`index.json unreadable: ${error.message}`) }

if (index) {
  for (const key of ['source', 'sourceFile', 'asOf', 'generatedAt', 'quality', 'availability', 'recordCount', 'schemaVersion', 'validationStatus']) if (!index.metadata?.[key]) errors.push(`index.metadata.${key} is required`)
  if (index.metadata?.schemaVersion !== 'mf-v2') errors.push('metadata.schemaVersion must be mf-v2')
  if (!Array.isArray(index.months) || !index.months.length) errors.push('index.months must not be empty')
  if (index.latestMonth !== index.months?.at(-1)) errors.push('latestMonth must equal the final month')
  const all = []
  const keys = new Set()
  for (const month of index.months ?? []) {
    if (!MONTH_RE.test(month)) { errors.push(`invalid indexed month ${month}`); continue }
    try {
      const payload = read(`by-month/${month}.json`)
      if (payload.month !== month) errors.push(`${month}: payload month mismatch`)
      for (const holding of payload.holdings ?? []) {
        if (!CORE_SCHEMES.some(([scheme]) => scheme === holding.scheme)) errors.push(`${month}: unexpected scheme ${holding.scheme}`)
        if (holding.month !== month) errors.push(`${month}: holding month mismatch`)
        if (!holding.stock || classifySecurityName(holding.stock).status === 'REJECTED') errors.push(`${month}: contaminated security ${holding.stock}`)
        if (holding.isin != null && !ISIN_RE.test(holding.isin)) errors.push(`${month}: invalid ISIN ${holding.isin}`)
        if (!holding.sourceSecurityName) errors.push(`${month}: missing source security name for ${holding.stock}`)
        if (!['SOURCE', 'CANONICAL_BY_ISIN', 'UNRESOLVED'].includes(holding.nameResolutionStatus)) errors.push(`${month}: invalid name resolution status for ${holding.stock}`)
        if (holding.nameResolutionStatus === 'CANONICAL_BY_ISIN' && (!holding.isin || !holding.canonicalSecurityName)) errors.push(`${month}: canonical resolution lacks exact ISIN provenance for ${holding.stock}`)
        if (!Number.isInteger(holding.sourceRow) || holding.sourceRow < 2) errors.push(`${month}: invalid source row for ${holding.stock}`)
        if (!Number.isFinite(holding.weight) || holding.weight < 0 || holding.weight > 100) errors.push(`${month}: invalid weight ${holding.weight}`)
        const key = `${holding.scheme}|${holding.month}|${holding.isin ?? holding.securityId}`
        if (keys.has(key)) errors.push(`duplicate holding ${key}`)
        keys.add(key)
        all.push(holding)
      }
    } catch (error) { errors.push(`missing or invalid by-month/${month}.json: ${error.message}`) }
  }
  if (all.length !== index.counts?.holdings || all.length !== index.metadata?.recordCount) errors.push(`holding count mismatch: files=${all.length}, index=${index.counts?.holdings}, metadata=${index.metadata?.recordCount}`)
  const observedValidIsinCount = all.filter(holding => ISIN_RE.test(holding.isin ?? '')).length
  const eligibleIsinCount = all.length
  const trust = index.trustMetadata
  const expectedValidIsinCount = trust?.isinDataAvailable ? observedValidIsinCount : null
  const expectedCoverage = trust?.isinDataAvailable && eligibleIsinCount ? Number((observedValidIsinCount / eligibleIsinCount * 100).toFixed(1)) : null
  if (!trust) errors.push('index.trustMetadata is required')
  else {
    if (trust.validIsinCount !== expectedValidIsinCount) errors.push(`trust valid ISIN count mismatch: metadata=${trust.validIsinCount}, expected=${expectedValidIsinCount}`)
    if (trust.eligibleIsinCount !== eligibleIsinCount) errors.push(`trust eligible ISIN count mismatch: metadata=${trust.eligibleIsinCount}, files=${eligibleIsinCount}`)
    if (trust.isinCoveragePercent !== expectedCoverage) errors.push(`trust ISIN coverage mismatch: metadata=${trust.isinCoveragePercent}, expected=${expectedCoverage}`)
    if (trust.quality !== index.metadata.quality) errors.push('trust quality must match dataset quality')
  }
  if (index.missingCoreSchemes?.length) warnings.push(`${index.missingCoreSchemes.length} intended schemes unavailable`)
  if (index.metadata?.quality === 'VERIFIED' && (warnings.length || index.missingCoreSchemes?.length)) errors.push('VERIFIED is not allowed with warnings or missing schemes')
  writeJson(path.join(root, '.validation.json'), { status: errors.length ? 'FAILED' : 'PASSED', validatedAt: index.metadata.generatedAt, errors, warnings, trust: { isinDataAvailable: trust?.isinDataAvailable ?? false, validIsinCount: expectedValidIsinCount, eligibleIsinCount, isinCoveragePercent: expectedCoverage }, contentHash: stableHash(JSON.stringify(all)) })
}
if (errors.length) { errors.forEach(error => console.error(`MF validation error: ${error}`)); process.exit(1) }
console.log(`MF staging valid: ${index.counts.holdings} holdings, ${index.counts.schemes} schemes; ${warnings.length} validation warnings.`)
