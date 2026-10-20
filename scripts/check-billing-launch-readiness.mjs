#!/usr/bin/env node
/**
 * Source-only release evidence audit. No network, credentials, mutations,
 * payment initiation, migrations, deployment or billing feature activation.
 * This does not substitute for owner sign-off or real end-to-end tests.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import assert from 'node:assert/strict'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const file = resolve(root, 'docs/billing/ALL_AT_ONCE_RELEASE_GATES.json')
const REQUIRED = [
  'source_ci', 'staging_identity', 'free_recovery', 'staging_migration_approval',
  'staging_auth_e2e', 'issuer_tax_privacy', 'whatsapp_otp', 'youpi_license',
  'youpi_security', 'merchant_beneficiary', 'slice_banked_credit',
  'pdf_archive', 'production_e2e_approval',
]

export function assessRelease(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) ||
      raw.schemaVersion !== 1 || raw.releaseMode !== 'ALL_AT_ONCE' ||
      raw.expectedSupabaseProjectRef !== 'jvpiulmcjjnsgozgqgzw' ||
      raw.productionBranch !== 'main' ||
      raw.featureBranch !== 'feature/youpi-payment-entry-prelaunch' ||
      raw.additionalSpendApprovedInr !== 0 ||
      !['NO_GO', 'GO'].includes(raw.releaseDecision) ||
      !Array.isArray(raw.gates) || raw.gates.length !== REQUIRED.length) {
    throw new Error('Invalid or unexpected billing release manifest')
  }

  const required = new Set(REQUIRED)
  const seen = new Set()
  for (const gate of raw.gates) {
    if (!gate || typeof gate !== 'object' || !required.has(gate.id) ||
        seen.has(gate.id) || !['VERIFIED', 'BLOCKED'].includes(gate.state) ||
        typeof gate.acceptance !== 'string' || gate.acceptance.length < 20) {
      throw new Error('Invalid, unknown or duplicate release gate')
    }
    if (gate.state === 'VERIFIED' &&
        (typeof gate.evidence !== 'string' ||
        !(gate.evidence.startsWith('docs/billing/') ||
          gate.evidence.startsWith('https://github.com/aqdas1820/credonomics-site/')))) {
      throw new Error('VERIFIED gate requires a non-secret auditable repository evidence reference')
    }
    if (gate.state === 'BLOCKED' && gate.evidence !== null) {
      throw new Error('Blocked gate cannot claim verified evidence')
    }
    seen.add(gate.id)
  }

  const blocked = raw.gates.filter(g => g.state !== 'VERIFIED').map(g => g.id)
  const allVerified = blocked.length === 0
  // Even full technical verification never automatically authorizes release:
  // require an explicit separate owner signoff and an affirmative decision.
  const ownerSignoff = typeof raw.ownerReleaseApprovalRef === 'string' &&
    raw.ownerReleaseApprovalRef.startsWith('docs/billing/') &&
    raw.ownerReleaseApprovalRef.length > 'docs/billing/'.length
  const ready = allVerified && raw.releaseDecision === 'GO' && ownerSignoff
  if (raw.releaseDecision === 'GO' && !ready) {
    throw new Error('GO decision is invalid without all gates and separate owner approval')
  }
  return { ready, blocked, verified: raw.gates.length - blocked.length, total: raw.gates.length }
}

function selfTest() {
  const m = JSON.parse(readFileSync(file, 'utf8'))
  const base = assessRelease(m)
  assert.equal(base.ready, false)
  assert.ok(base.blocked.includes('whatsapp_otp'))
  assert.ok(base.blocked.includes('youpi_license'))
  const clone = obj => JSON.parse(JSON.stringify(obj))
  const duplicate = clone(m)
  duplicate.gates[1].id = duplicate.gates[0].id
  assert.throws(() => assessRelease(duplicate), /duplicate/)
  const falseEvidence = clone(m)
  falseEvidence.gates[2].state = 'VERIFIED'
  assert.throws(() => assessRelease(falseEvidence), /evidence/)
  const wrongProject = clone(m)
  wrongProject.expectedSupabaseProjectRef = 'tpllgtskvvkronmbxkmg'
  assert.throws(() => assessRelease(wrongProject), /Invalid/)
  const prematureGo = clone(m)
  prematureGo.releaseDecision = 'GO'
  assert.throws(() => assessRelease(prematureGo), /GO decision/)
  process.stdout.write('PASS 5 fail-closed release-gate checks (no provider operations)\n')
}

const args = new Set(process.argv.slice(2))
if (args.has('--self-test')) selfTest()
else {
  if ([...args].some(a => !['--report', '--require-ready', '--assert-blocked'].includes(a))) {
    throw new Error('Unknown launch gate checker argument')
  }
  const result = assessRelease(JSON.parse(readFileSync(file, 'utf8')))
  process.stdout.write(`CredoNomics ALL_AT_ONCE release: ${result.ready ? 'READY FOR HUMAN REVIEW' : 'NO GO'}; ${result.verified}/${result.total} documented gates; ${result.blocked.length} blocked\n`)
  for (const id of result.blocked) process.stdout.write(`BLOCKED: ${id}\n`)
  if (args.has('--require-ready') && !result.ready) process.exitCode = 1
  if (args.has('--assert-blocked') && result.ready) process.exitCode = 1
}
