import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {preparePilotSql} from './prepare-billing-pilot-sql.mjs'
const expected=JSON.parse(await fs.readFile(new URL('../docs/billing/PHASE32_BOOTSTRAP_HASHES.json',import.meta.url),'utf8'))
const actual=await preparePilotSql()
assert.equal(actual.sha256,expected.sha256,'Atomic bootstrap bundle changed; independent review required')
assert.deepEqual(actual.files,expected.files,'Bootstrap script hashes changed')
console.log('All eight Phase31 SQL hashes and atomic bundle hash match; no database contacted.')
