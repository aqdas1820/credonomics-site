import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assess, digest, inspect, compare } from './verify-migration.mjs'

test('verification TXT never appears in output; split strings rejoin before comparison', async () => {
  const secret = 'google-site-verification=SYNTHETIC-ONLY'
  const result = await inspect({ domain: 'credonomics.in', records: [
    { id: 'google', name: 'credonomics.in', type: 'TXT', prefix: 'google-site-verification=', sha256: [digest(secret)] },
  ] }, { resolve: async () => [['google-site-', 'verification=SYNTHETIC-ONLY']] })
  assert.equal(result.results[0].status, 'PASS')
  assert.ok(!JSON.stringify(result).includes(secret))
  assert.equal(result.scope, 'PUBLIC_DNS_ONLY_NOT_PENDING_ZONE')
  assert.equal(compare(result, result)[0].status, 'PASS')
})
test('exact MX comparison rejects missing, wrong priority and extra servers', () => {
  const record = { type: 'MX', expected: ['10 mx1.improvmx.com', '20 mx2.improvmx.com'] }
  assert.equal(assess(record, record.expected).status, 'PASS')
  assert.equal(assess(record, ['10 mx1.improvmx.com']).status, 'FAIL')
  assert.equal(assess(record, [...record.expected, '30 other.test']).status, 'FAIL')
})
test('missing expected targets warn; duplicate SPF and permissive all fail', () => {
  assert.equal(assess({ type: 'A' }, ['1.1.1.1']).status, 'WARN')
  const r = { id: 'spf', type: 'TXT', prefix: 'v=spf1' }
  assert.equal(assess(r, ['v=spf1 include:spf.improvmx.com +all']).status, 'FAIL')
  assert.equal(assess(r, ['v=spf1 -all', 'v=spf1 ~all']).status, 'FAIL')
})
test('resolver errors are redacted and distinguished from absent records', async () => {
  const config = { domain: 'credonomics.in', records: [{ id: 'google', name: 'credonomics.in', type: 'TXT' }] }
  const result = await inspect(config, { resolve: async () => { throw Object.assign(Error('SECRET'), { code: 'ETIMEOUT' }) } })
  assert.equal(result.results[0].status, 'WARN')
  assert.ok(!JSON.stringify(result).includes('SECRET'))
})
