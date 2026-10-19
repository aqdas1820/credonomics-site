import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
const baseline = JSON.parse(readFileSync('docs/billing/PHASE26_PRODUCTION_BASELINE.json', 'utf8'))
for (const [path, expected] of Object.entries(baseline.gitBlobs)) {
  const actual = execFileSync('git', ['hash-object', '--path=' + path, path], { encoding: 'utf8' }).trim()
  assert.equal(actual, expected, 'Production intelligence changed: ' + path)
}
console.log(`PASS all ${Object.keys(baseline.gitBlobs).length} production card/IPO blobs match main ${baseline.productionMain}`)
