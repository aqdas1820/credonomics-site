import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { D1TokenRows, EncryptedTokenStore, schema } from './store.mjs'

const NOW = Date.parse('2030-01-01T00:00:00.000Z')
const TOKEN = 'SYNTHETIC-ONLY-not-a-provider-credential'
const metadata = { source: 'oauth_callback', status: 'VALID', expiresAt: '2030-01-01T01:00:00.000Z' }
const key = () => crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
// Small D1 binding shim only; all SQL, constraints and row-count behavior run in SQLite.
function binding(db) {
  return { prepare(sql) { return { bind(...args) { return {
    async first() { return db.prepare(sql).get(...args) ?? null },
    async run() { const result = db.prepare(sql).run(...args); return { success: true, meta: { changes: Number(result.changes) } } },
  } } } } }
}
async function fixture() {
  const db = new DatabaseSync(':memory:'); db.exec(schema)
  const keys = new Map([['k1', await key()]])
  const rows = new D1TokenRows(binding(db))
  const options = { keys, activeKeyId: 'k1', scope: 'synthetic:test', clock: () => NOW }
  return { db, rows, keys, options, store: new EncryptedTokenStore(rows, options), close: () => db.close() }
}
test('encrypted at rest; independently constructed reader recovers exact synthetic token', async () => {
  const f = await fixture()
  try {
    assert.equal(await f.store.saveToken(TOKEN, metadata, 0), 1)
    const row = await f.rows.read()
    assert.equal(row.envelope.includes(TOKEN), false)
    assert.equal(row.envelope.includes('oauth_callback'), false)
    const reader = new EncryptedTokenStore(f.rows, f.options)
    const lease = await reader.getTokenLease()
    assert.equal(lease.token === TOKEN, true); assert.equal(lease.revision, 1)
  } finally { f.close() }
})
test('cold recovery from encrypted disk persists across closed SQLite connections', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'cn-synthetic-vault-'))
  const path = join(dir, 'fixture.sqlite')
  let db
  try {
    db = new DatabaseSync(path); db.exec(schema)
    // Synthetic recovery material: independently re-imported after closing the connection.
    // Real key custody is explicitly NOT configured or proven by this rehearsal.
    const recoveryMaterial = crypto.getRandomValues(new Uint8Array(32))
    const importKey = () => crypto.subtle.importKey('raw', recoveryMaterial, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
    const originalKey = await importKey()
    const options = { keys: new Map([['k1', originalKey]]), activeKeyId: 'k1', scope: 'synthetic:disk', clock: () => NOW }
    await new EncryptedTokenStore(new D1TokenRows(binding(db)), options).saveToken(TOKEN, metadata, 0)
    db.close(); db = undefined
    assert.equal((await readFile(path)).includes(Buffer.from(TOKEN)), false)
    db = new DatabaseSync(path)
    const recovered = { ...options, keys: new Map([['k1', await importKey()]]) }
    recoveryMaterial.fill(0)
    assert.equal((await new EncryptedTokenStore(new D1TokenRows(binding(db)), recovered).getTokenLease()).token === TOKEN, true)
  } finally { db?.close(); await rm(dir, { recursive: true, force: true }) }
})
test('create-only initial import and concurrent rotations have one winner', async () => {
  const f = await fixture()
  try {
    const stores = Array.from({ length: 12 }, () => new EncryptedTokenStore(f.rows, f.options))
    const initial = await Promise.allSettled(stores.map(s => s.saveToken(TOKEN, metadata, 0)))
    assert.equal(initial.filter(x => x.status === 'fulfilled').length, 1)
    const rotated = await Promise.allSettled(stores.map(s => s.saveToken('SYNTHETIC-rotated', metadata, 1)))
    assert.equal(rotated.filter(x => x.status === 'fulfilled').length, 1)
    assert.equal((await f.rows.read()).revision, 2)
  } finally { f.close() }
})
test('two file-backed connections enforce the same optimistic lock', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'cn-synthetic-lock-')); let a; let b
  try {
    a = new DatabaseSync(join(dir, 'fixture.sqlite')); a.exec(schema)
    b = new DatabaseSync(join(dir, 'fixture.sqlite'))
    const options = { keys: new Map([['k1', await key()]]), activeKeyId: 'k1', scope: 'synthetic:two', clock: () => NOW }
    const stores = [a, b].map(db => new EncryptedTokenStore(new D1TokenRows(binding(db)), options))
    const results = await Promise.allSettled(stores.map(s => s.saveToken(TOKEN, metadata, 0)))
    assert.equal(results.filter(x => x.status === 'fulfilled').length, 1)
  } finally { a?.close(); b?.close(); await rm(dir, { recursive: true, force: true }) }
})
test('stale expiry cannot invalidate a rotated credential', async () => {
  const f = await fixture()
  try {
    await f.store.saveToken(TOKEN, metadata, 0)
    const lease = await f.store.getTokenLease()
    await f.store.saveToken('SYNTHETIC-new', metadata, 1)
    assert.equal(await f.store.markExpired(lease.revision), false)
    assert.equal((await f.store.getTokenLease()).revision, 2)
    assert.equal(await f.store.markExpired(2), true)
    assert.equal(await f.store.getTokenLease(), null)
  } finally { f.close() }
})
test('request-state conflict re-reads preserve concurrently rotated token', async () => {
  const f = await fixture()
  try {
    await f.store.saveToken(TOKEN, metadata, 0)
    const a = new EncryptedTokenStore(f.rows, f.options)
    const b = new EncryptedTokenStore(f.rows, f.options)
    await Promise.all([a.saveToken('SYNTHETIC-new', metadata, 1), b.updateRequestState('REQUEST_PENDING', '2030-01-01T00:10:00.000Z')])
    const lease = await f.store.getTokenLease()
    assert.equal(lease.token === 'SYNTHETIC-new', true)
    assert.equal((await f.store.getMetadata()).requestStatus, 'REQUEST_PENDING')
  } finally { f.close() }
})
test('missing, malformed and noncanonical expiry are refused; UNKNOWN returns no token', async () => {
  const f = await fixture()
  try {
    for (const expiresAt of [undefined, 'invalid', '2030-02-30T01:00:00.000Z', '2030-01-01']) {
      await assert.rejects(f.store.saveToken(TOKEN, { ...metadata, expiresAt }, 0), { message: 'Token persistence unavailable' })
    }
    await f.store.saveToken(TOKEN, { source: 'environment', status: 'UNKNOWN' }, 0)
    assert.equal(await f.store.getTokenLease(), null)
  } finally { f.close() }
})
test('expiry skew and pending-request deadline fail closed without a write', async () => {
  const f = await fixture()
  try {
    await f.store.saveToken(TOKEN, { ...metadata, expiresAt: '2030-01-01T00:00:30.000Z' }, 0)
    await f.store.updateRequestState('APPROVAL_REQUIRED', '2029-12-31T23:59:00.000Z')
    assert.equal(await f.store.getTokenLease(), null)
    const m = await f.store.getMetadata()
    assert.equal(m.status, 'EXPIRED'); assert.equal(m.requestStatus, 'REQUEST_EXPIRED')
    assert.equal((await f.rows.read()).revision, 2)
  } finally { f.close() }
})
test('ciphertext, revision, key and scope tampering fail closed with generic errors', async () => {
  const f = await fixture()
  try {
    await f.store.saveToken(TOKEN, metadata, 0)
    const row = await f.rows.read()
    const e = JSON.parse(row.envelope)
    const cases = [
      { ...row, revision: 2 },
      { ...row, envelope: '{' + TOKEN },
      { ...row, envelope: JSON.stringify({ ...e, iv: '00'.repeat(12) }) },
      { ...row, envelope: JSON.stringify({ ...e, cipher: e.cipher.slice(0, -2) + (e.cipher.endsWith('00') ? '01' : '00') }) },
      { ...row, envelope: JSON.stringify({ ...e, kid: 'missing' }) },
    ]
    for (const bad of cases) {
      const s = new EncryptedTokenStore({ read: async () => bad }, f.options)
      await assert.rejects(s.getTokenLease(), { message: 'Token persistence unavailable' })
    }
    for (const options of [{ ...f.options, scope: 'synthetic:other' }, { ...f.options, keys: new Map([['k1', await key()]]) }]) {
      await assert.rejects(new EncryptedTokenStore(f.rows, options).getTokenLease(), { message: 'Token persistence unavailable' })
    }
  } finally { f.close() }
})
test('encrypted rollback re-encrypts at a higher revision; expired snapshot never revives', async () => {
  const f = await fixture()
  try {
    await f.store.saveToken(TOKEN, { ...metadata, expiresAt: '2029-12-31T23:00:00.000Z' }, 0)
    const snapshot = await f.store.encryptedSnapshot()
    await f.store.saveToken('SYNTHETIC-new', metadata, 1)
    assert.equal(await f.store.restoreEncrypted(snapshot, 2), 3)
    assert.equal(await f.store.getTokenLease(), null)
    assert.notEqual((await f.rows.read()).envelope, snapshot.envelope)
    await assert.rejects(f.store.restoreEncrypted(snapshot, 2), { message: 'Token persistence conflict' })
  } finally { f.close() }
})
test('key rotation retains old recovery keys; ciphertext is rewrapped with active key', async () => {
  const f = await fixture()
  try {
    await f.store.saveToken(TOKEN, metadata, 0)
    const snapshot = await f.store.encryptedSnapshot()
    const keys = new Map([...f.keys, ['k2', await key()]])
    const rotated = new EncryptedTokenStore(f.rows, { ...f.options, keys, activeKeyId: 'k2' })
    await rotated.restoreEncrypted(snapshot, 1)
    assert.equal(JSON.parse((await f.rows.read()).envelope).kid, 'k2')
    assert.equal((await rotated.getTokenLease()).token === TOKEN, true)
    const lost = new EncryptedTokenStore(f.rows, { ...f.options, keys: new Map([['k2', keys.get('k2')]]), activeKeyId: 'k2' })
    await assert.rejects(lost.restoreEncrypted(snapshot, 2), { message: 'Token persistence unavailable' })
  } finally { f.close() }
})
test('independent minimum revision detects whole-row rollback and deletion', async () => {
  const f = await fixture()
  try {
    await f.store.saveToken(TOKEN, metadata, 0)
    const snapshot = await f.store.encryptedSnapshot()
    await f.store.saveToken(TOKEN, metadata, 1)
    for (const row of [snapshot, null]) {
      const s = new EncryptedTokenStore({ read: async () => row }, { ...f.options, minimumRevision: 2 })
      await assert.rejects(s.getTokenLease(), { message: 'Token persistence unavailable' })
    }
  } finally { f.close() }
})
test('quota/permission faults are sanitized and never fall back to a plaintext store', async () => {
  const f = await fixture()
  try {
    const bad = new D1TokenRows({ prepare() { throw new Error(TOKEN) } })
    await assert.rejects(bad.read(), { message: 'Token persistence unavailable' })
    await assert.rejects(bad.compareAndSwap(0, '{}'), { message: 'Token persistence unavailable' })
    const broken = new EncryptedTokenStore({ read: async () => null, compareAndSwap: async () => { throw new Error('Token persistence unavailable') } }, f.options)
    await assert.rejects(broken.saveToken(TOKEN, metadata, 0), { message: 'Token persistence unavailable' })
  } finally { f.close() }
})
test('bounded contention does not spin forever or accept stale writes', async () => {
  const f = await fixture(); let writes = 0
  try {
    const s = new EncryptedTokenStore({ read: async () => null, compareAndSwap: async () => { writes++; return false } }, f.options)
    await assert.rejects(s.updateRequestState('REQUEST_PENDING'), { message: 'Token persistence conflict' })
    assert.equal(writes, 4)
  } finally { f.close() }
})
test('synthetic legacy import preserves metadata and refuses a second initial import', async () => {
  const f = await fixture()
  try {
    const legacy = { token: TOKEN, metadata: { ...metadata, createdAt: '2029-12-31T23:00:00.000Z',
      requestStatus: 'REQUEST_PENDING', requestExpiresAt: '2030-01-01T00:10:00.000Z' } }
    const unchanged = JSON.stringify(legacy)
    await f.store.commit(0, legacy)
    assert.equal(JSON.stringify(legacy), unchanged)
    assert.deepEqual(await f.store.getMetadata(), legacy.metadata)
    await assert.rejects(new EncryptedTokenStore(f.rows, f.options).commit(0, legacy), { message: 'Token persistence conflict' })
  } finally { f.close() }
})
test('lost commit acknowledgement does not overwrite committed state on retry', async () => {
  const f = await fixture()
  try {
    const rows = { read: () => f.rows.read(), compareAndSwap: async (...args) => {
      await f.rows.compareAndSwap(...args); throw new Error('Token persistence unavailable')
    } }
    const s = new EncryptedTokenStore(rows, f.options)
    await assert.rejects(s.saveToken(TOKEN, metadata, 0), { message: 'Token persistence unavailable' })
    assert.equal((await f.store.getTokenLease()).revision, 1)
    await assert.rejects(s.saveToken('SYNTHETIC-stale', metadata, 0), { message: 'Token persistence conflict' })
    assert.equal((await f.store.getTokenLease()).token === TOKEN, true)
  } finally { f.close() }
})
test('extractable or undersized keys and invalid clocks are refused', async () => {
  const f = await fixture()
  try {
    for (const [length, extractable] of [[128, false], [256, true]]) {
      const unsafe = await crypto.subtle.generateKey({ name: 'AES-GCM', length }, extractable, ['encrypt', 'decrypt'])
      assert.throws(() => new EncryptedTokenStore(f.rows, { ...f.options, keys: new Map([['k1', unsafe]]) }), { message: 'Token persistence unavailable' })
    }
    await f.store.saveToken(TOKEN, metadata, 0)
    await assert.rejects(new EncryptedTokenStore(f.rows, { ...f.options, clock: () => NaN }).getTokenLease(), { message: 'Token persistence unavailable' })
  } finally { f.close() }
})
