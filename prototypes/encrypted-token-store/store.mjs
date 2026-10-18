// Inert feasibility library. No network endpoints, environment reads or file imports.
// D1 binding contract; tests use real local SQLite. Not wired into Railway.
const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })
const fail = () => new Error('Token persistence unavailable')
const conflict = () => new Error('Token persistence conflict')
const sources = ['environment', 'oauth_callback', 'notifier_webhook']
const requests = ['NONE', 'REQUEST_PENDING', 'APPROVAL_REQUIRED', 'REQUEST_REJECTED', 'REQUEST_EXPIRED']
const isTime = x => typeof x === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x) &&
  Number.isFinite(Date.parse(x)) && new Date(x).toISOString() === x
const revisionOK = x => Number.isSafeInteger(x) && x >= 0
const keyIdOK = x => typeof x === 'string' && /^[a-zA-Z0-9_-]{1,40}$/.test(x)
const hex = b => Array.from(new Uint8Array(b), n => n.toString(16).padStart(2, '0')).join('')
const unhex = s => {
  if (typeof s !== 'string' || s.length % 2 || !/^[a-f0-9]+$/.test(s)) throw fail()
  return Uint8Array.from(s.match(/../g), x => parseInt(x, 16))
}
function validate(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record) ||
      Object.keys(record).some(k => !['token', 'metadata'].includes(k))) throw fail()
  const m = record.metadata
  if (typeof record.token !== 'string' || record.token.length > 8192 ||
      /[\r\n\u0000]/.test(record.token) || !m || typeof m !== 'object' || Array.isArray(m) ||
      Object.keys(m).some(k => !['createdAt', 'source', 'status', 'issuedAt', 'expiresAt', 'requestStatus', 'requestExpiresAt'].includes(k)) ||
      !isTime(m.createdAt) || !sources.includes(m.source) || !['VALID', 'EXPIRED', 'UNKNOWN'].includes(m.status) ||
      (m.issuedAt !== undefined && !isTime(m.issuedAt)) ||
      (m.expiresAt !== undefined && !isTime(m.expiresAt)) ||
      (m.requestExpiresAt !== undefined && !isTime(m.requestExpiresAt)) ||
      (m.requestStatus !== undefined && !requests.includes(m.requestStatus)) ||
      (m.status === 'VALID' && (!record.token.trim() || !isTime(m.expiresAt))) ||
      (m.issuedAt && m.expiresAt && Date.parse(m.issuedAt) >= Date.parse(m.expiresAt))) throw fail()
  return record
}
export const schema = `CREATE TABLE token_vault (
  id TEXT PRIMARY KEY CHECK (id = 'upstox'),
  revision INTEGER NOT NULL CHECK (revision > 0),
  envelope TEXT NOT NULL CHECK (length(envelope) <= 40000)
) STRICT;`

// Atomic SQL is the lock: no isolate mutex, eventual-consistency KV or multi-query transaction.
// With read replication enabled, pass DB.withSession('first-primary'), not a replica binding.
export class D1TokenRows {
  constructor(db) { this.db = db }
  async read() {
    try { return await this.db.prepare('SELECT revision, envelope FROM token_vault WHERE id = ?').bind('upstox').first() }
    catch { throw fail() }
  }
  async compareAndSwap(expected, envelope) {
    if (!revisionOK(expected) || expected >= Number.MAX_SAFE_INTEGER || typeof envelope !== 'string' || envelope.length > 40000) throw fail()
    try {
      const statement = expected === 0
        ? this.db.prepare('INSERT INTO token_vault (id, revision, envelope) VALUES (?, 1, ?) ON CONFLICT(id) DO NOTHING').bind('upstox', envelope)
        : this.db.prepare('UPDATE token_vault SET revision = revision + 1, envelope = ? WHERE id = ? AND revision = ?').bind(envelope, 'upstox', expected)
      const result = await statement.run()
      if (!result.success || ![0, 1].includes(result.meta?.changes)) throw fail()
      return result.meta.changes === 1
    } catch { throw fail() }
  }
}

export class EncryptedTokenStore {
  // Keys are non-extractable CryptoKeys supplied privately by caller; never serialized here.
  constructor(rows, { keys, activeKeyId, scope, clock = Date.now, minimumRevision = 0, expirySkewMs = 30000 }) {
    if (!(keys instanceof Map) || !keyIdOK(activeKeyId) || !keys.has(activeKeyId) ||
        typeof scope !== 'string' || !/^[a-zA-Z0-9:_-]{1,100}$/.test(scope) ||
        !revisionOK(minimumRevision) || !Number.isSafeInteger(expirySkewMs) || expirySkewMs < 0) throw fail()
    for (const [id, key] of keys) {
      if (!keyIdOK(id) || key?.type !== 'secret' || key.extractable !== false || key.algorithm?.name !== 'AES-GCM' ||
          key.algorithm.length !== 256 || !key.usages.includes('encrypt') || !key.usages.includes('decrypt')) throw fail()
    }
    this.rows = rows; this.keys = new Map(keys); this.active = activeKeyId; this.scope = scope
    this.clock = clock; this.floor = minimumRevision; this.skew = expirySkewMs
  }
  aad(revision, keyId) { return encoder.encode(JSON.stringify(['credonomics-upstox', 1, this.scope, 'upstox', revision, keyId])) }
  nowIso() {
    try { const now = this.clock(); if (!Number.isSafeInteger(now)) throw fail(); return new Date(now).toISOString() }
    catch { throw fail() }
  }
  async seal(record, revision) {
    try {
      validate(record)
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: this.aad(revision, this.active), tagLength: 128 },
        this.keys.get(this.active), encoder.encode(JSON.stringify(record)))
      return JSON.stringify({ v: 1, kid: this.active, iv: hex(iv), cipher: hex(cipher) })
    } catch { throw fail() }
  }
  async open(row) {
    try {
      if (!row || !revisionOK(row.revision) || row.revision === 0 || typeof row.envelope !== 'string' || row.envelope.length > 40000) throw fail()
      const e = JSON.parse(row.envelope)
      if (e.v !== 1 || !keyIdOK(e.kid) || !this.keys.has(e.kid) ||
          Object.keys(e).sort().join(',') !== 'cipher,iv,kid,v' || typeof e.iv !== 'string' || e.iv.length !== 24 ||
          typeof e.cipher !== 'string' || e.cipher.length < 32 || e.cipher.length > 36000) throw fail()
      const clear = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unhex(e.iv), additionalData: this.aad(row.revision, e.kid), tagLength: 128 },
        this.keys.get(e.kid), unhex(e.cipher))
      return validate(JSON.parse(decoder.decode(clear)))
    } catch { throw fail() }
  }
  async current() {
    try {
      const row = await this.rows.read()
      if (!row) { if (this.floor > 0) throw fail(); return { revision: 0, record: null } }
      if (row.revision < this.floor) throw fail()
      const record = await this.open(row)
      if (row.revision < this.floor) throw fail()
      this.floor = row.revision
      return { revision: row.revision, record }
    } catch { throw fail() }
  }
  async getTokenLease() {
    const { revision, record } = await this.current()
    const now = this.clock()
    if (!Number.isSafeInteger(now)) throw fail()
    if (!record || record.metadata.status !== 'VALID' || Date.parse(record.metadata.expiresAt) <= now + this.skew) return null
    return { token: record.token, revision }
  }
  async getMetadata() {
    const { record } = await this.current()
    if (!record) return null
    const m = structuredClone(record.metadata)
    const now = this.clock()
    if (!Number.isSafeInteger(now)) throw fail()
    if (m.status === 'VALID' && Date.parse(m.expiresAt) <= now + this.skew) m.status = 'EXPIRED'
    if (m.requestExpiresAt && Date.parse(m.requestExpiresAt) <= now && ['REQUEST_PENDING', 'APPROVAL_REQUIRED'].includes(m.requestStatus)) m.requestStatus = 'REQUEST_EXPIRED'
    return m
  }
  async commit(expected, record) {
    if (!revisionOK(expected) || expected < this.floor || expected >= Number.MAX_SAFE_INTEGER) throw conflict()
    const envelope = await this.seal(record, expected + 1)
    let written
    try { written = await this.rows.compareAndSwap(expected, envelope) } catch { throw fail() }
    if (!written) throw conflict()
    this.floor = Math.max(this.floor, expected + 1)
    return expected + 1
  }
  // expectedRevision is mandatory: callback/webhook retry cannot overwrite a newer rotation.
  async saveToken(token, metadata, expectedRevision) {
    const state = await this.current()
    if (state.revision !== expectedRevision) throw conflict()
    const record = { token, metadata: { ...metadata, createdAt: this.nowIso(),
      requestStatus: state.record?.metadata.requestStatus ?? 'NONE',
      ...(state.record?.metadata.requestExpiresAt ? { requestExpiresAt: state.record.metadata.requestExpiresAt } : {}) } }
    return this.commit(expectedRevision, record)
  }
  async markExpired(expectedRevision) {
    const state = await this.current()
    if (state.revision !== expectedRevision || !state.record) return false
    state.record.metadata.status = 'EXPIRED'
    try { await this.commit(expectedRevision, state.record); return true }
    catch (error) { if (error.message === 'Token persistence conflict') return false; throw error }
  }
  async updateRequestState(status, expiresAt) {
    if (!requests.includes(status) || (expiresAt !== undefined && !isTime(expiresAt))) throw fail()
    // Re-read on optimistic-lock conflict only, bounded retries, never retry storage/crypto faults.
    for (let attempt = 0; attempt < 4; attempt++) {
      const state = await this.current()
      const record = state.record ?? { token: '', metadata: { createdAt: this.nowIso(), source: 'notifier_webhook', status: 'UNKNOWN' } }
      record.metadata.requestStatus = status
      delete record.metadata.requestExpiresAt
      if (expiresAt !== undefined) record.metadata.requestExpiresAt = expiresAt
      try { return await this.commit(state.revision, record) }
      catch (error) { if (error.message !== 'Token persistence conflict') throw error }
    }
    throw conflict()
  }
  async encryptedSnapshot() {
    // Operator-only primitive, not an HTTP route. Caller must retain encrypted bytes privately.
    const row = await this.rows.read()
    await this.open(row)
    return structuredClone(row)
  }
  async restoreEncrypted(snapshot, expectedRevision) {
    // Recovery/rollback is an explicit new fenced write; never rewind revision or insert raw ciphertext.
    // Restored expired tokens remain unusable. Caller authorizes any still-valid older credential.
    const record = await this.open(snapshot)
    await this.current()
    return this.commit(expectedRevision, record)
  }
}
