# Upstox encrypted persistence: synthetic engineering rehearsal

Status: LOCAL PROTOTYPE PASS; REAL MIGRATION / DEPLOYMENT BLOCKED.
Reviewed 2026-10-18. No Railway token, volume, environment file or credential was read.
Backend source inspected at `3bcfe78e24de1924b2be301ad9c66f887c2bd5ed`, also verified as current remote main.
This document authorizes no infrastructure or secret operation.

## Existing contract and concrete risks

`src/providers/upstox/upstox-token-store.ts` in the backend stores plaintext JSON using a
temporary file and rename. Rename avoids partially replaced destination contents, but does
not serialize read/modify/write across processes, provide durable revision fencing, or prove
fsync-based crash recovery. Filename timestamps can collide. Mode 0600 is not encryption.
Missing expiry is accepted; malformed expiry can bypass the date comparison. Request-state
updates, callback saves and `markExpired()` can overwrite each other.

`UpstoxHttpClient.fetchOnce()` reads a token then later invokes an unversioned
`markTokenExpired` callback. A rejection for token A can expire token B saved in the meantime.
`buildApp()` injects one `UpstoxTokenStore` into provider/admin/webhook paths; replacing only
the filesystem class is insufficient. No backend runtime was started and no backend source
was modified in this assignment.

## Proposed destination and cost boundary

Prefer a small Cloudflare Workers Free + D1 Free vault **inside a future Worker**, with
application-layer AES-256-GCM before persistence. D1 bindings are not directly available to
Railway Fastify. Moving the appropriate request-scoped backend slice or implementing a
separately reviewed authenticated bridge is required. This prototype intentionally exposes
no network vault endpoint. Never give the Railway app a broad Cloudflare management token.

Official [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) currently lists
5 million rows read/day, 100,000 rows written/day and 5 GB total storage on Free. Free quota
exhaustion blocks queries; Paid has billable overages. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
adds its own request/CPU constraints. Inference: a single indexed token row with bounded
rotation traffic fits those allowances comfortably; this is not a measured production load
test or a guarantee of future pricing. Account eligibility, current shared quota, CPU use,
data residency, provider terms and a hard Free-plan-only deployment must be owner-verified.
No account, database, Worker or paid plan was created. Actual additional spend: ₹0.

Illustrative budget: 1,000 invocations/day, two indexed reads/invocation and 100 row updates/day
are about 2,000 row reads and 100 data-row writes, plus index/DDL costs. Do not poll once per
market tick or migrate continuous Upstox WebSockets unchanged. Admission control, aggregate
account monitoring and fail-closed quota behavior need hosted validation before release.
No paid upgrade or paid fallback is allowed.

Rejected as a locking authority: eventually consistent KV, Git/GitHub secrets updates,
ephemeral Worker files, and unsynchronized dual writes. Existing Supabase could also store
encrypted records with transactional CAS, but requires separately approved schema, grants,
credentials and recovery; those blocked infrastructure tasks are not duplicated here.

## Implemented, inert library

`prototypes/encrypted-token-store/store.mjs` has no network handler, environment reads, file
importer or provider calls. Tests use only synthetic values and disposable SQLite.

- Encrypt the entire token + metadata record with Web Crypto AES-256-GCM, fresh random
  96-bit nonce, 128-bit tag and a non-extractable 256-bit CryptoKey. Keys are supplied by a
  trusted server caller, never stored in the row. The envelope holds format, key ID, nonce
  and ciphertext. Token/metadata remain encrypted; fixed row ID, revision and ciphertext
  length are visible. Server memory necessarily contains plaintext while using a token.
- Authenticate format, deployment scope, record identity, key ID and revision as AAD.
  Cross-environment transplant, revision alteration, wrong keys and modified ciphertext fail.
- One primary-key row, one atomic conditional INSERT/UPDATE per commit. Revision is the
  optimistic lock and fencing value. No application mutex, lease timeout or orphan-lock
  cleanup is needed. Only one competing writer can advance an expected revision.
- Use [D1 prepared statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)
  with bound values and verify `success` plus `meta.changes`. If using read replication,
  supply `DB.withSession('first-primary')`; never treat a replica read as a locking authority.
  Actual D1 binding semantics, network faults and primary-session behavior are NOT tested.
- `getTokenLease()` returns `{token, revision}` to trusted server code. On provider rejection,
  expire that revision only. `saveToken` requires an expected revision; stale webhook/callback
  writes fail instead of silently overwriting. Request-state updates re-read/retry only CAS
  conflicts, at most four attempts. No plaintext fallback on quota, permission or crypto error.
- Require VALID status and explicit canonical UTC expiry before returning a token; use a
  30-second safety margin. UNKNOWN, missing/invalid expiry, expired tokens and bad clocks
  fail closed. Expired pending requests are projected as expired without background timers.
  Verify expiry from authorized provider issuance data; do not invent or extend expiry from
  the migration time. Historical UNKNOWN records may be retained encrypted but cannot serve.
- Snapshot export is ciphertext only and operator-only, with no HTTP route. Recovery decrypts
  an approved snapshot and re-encrypts at the current revision + 1. Expired snapshots stay
  unusable; rollback never rewinds a revision. Recovery can deliberately restore an older
  still-valid credential, so operator/provider confirmation is mandatory.
- Key rotation reads old key IDs, writes the active key ID and rewraps through a fenced write.
  Retain old keys privately for the required snapshot retention period. A header, key ID or
  encrypted export cannot recover a lost AES key. Independent key custody is NOT configured.

Web Crypto support is documented by [Cloudflare](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/).
Runtime key injection would use owner-controlled [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
plus independently recoverable offline key custody, after separate approval. Never use a
`NEXT_PUBLIC_` variable, command-line secret, source literal, log or Git artifact for keys.

## Recovery and threat limits

AES-GCM detects unauthorized changes without the key; it does not defeat a compromised
runtime holding that key. A privileged database operator can delete records or replay an
entire formerly valid encrypted row. A process retains a revision high-water mark and can
be started with an independently retained `minimumRevision`; that detects older rows and
unexpected deletion. This is NOT an implemented durable global anti-rollback service.
Cold starts without an independent checkpoint cannot distinguish a full historical replay.
Choose and test checkpoint custody before live migration; do not store the only checkpoint
in the same recoverable database. No WORM, automatic provider revocation or active-active
multi-region safety claim is made.

The disk-recovery test closes SQLite, re-imports a separately retained SYNTHETIC key and
opens a fresh connection. It proves local encrypted persistence and key re-import, not
owner key recovery, D1 Time Travel, actual cloud durability or full Railway recovery.
Concurrency tests use independent SQLite connections and parallel asynchronous writers
in one Node process, not distributed Workers or a multiprocess load generator.

## Exact integration sequence — NOT EXECUTED

1. Review this source, the CAS SQL and threat limits; keep PR #2 integration separate from
   any deployment. Approve a destination account/Free plan and security/data-residency terms.
2. Select Worker-native request handling or review an authenticated, scoped bridge. Preserve
   existing admin, OAuth state, notifier verification, scheduler and entitlement boundaries.
   OAuth state must also become durable/one-time; an in-memory map cannot span Workers.
3. In a separate backend source PR, change the store/client interface together to carry
   token revisions through provider requests and conditional invalidation. Every callback,
   notifier and request-state writer must participate in CAS. Handle ambiguous acknowledgments
   by re-reading privately; never blindly retry a stale overwrite. Add callback replay/event
   idempotency and integration tests against actual backend controllers. This prototype is
   deliberately NOT a drop-in implementation of the current unversioned interface.
4. After separate infrastructure approval only, provision/verify Free D1 and reviewed schema,
   inject keys privately, establish independently recoverable key/checkpoint custody, and
   measure quota/CPU/primary consistency. Test outage, permission and recovery in synthetic
   hosted fixtures. Do not enable live data/payments as part of that work.
5. Owner-operated live cutover requires separate explicit approval to access the real token.
   Quiesce ALL token writers first (callback, notifier, scheduler, legacy process). Privately
   preserve the original file in approved encrypted recovery storage. Normalize/validate the
   existing record, preserve metadata and provider expiry, and import with expected revision
   0 only. This repository contains no live-file importer. Never paste token/hash/records
   into a PR or this chat. Unknown/expired credentials remain unavailable, with owner-managed
   reauthorization outside this assignment.
6. Privately read back/decrypt and compare in-process, verify metadata/expiry, record only
   pass/fail and revision, then switch the sole writer. Maintain the old volume unchanged.
   No simultaneous file/D1 writers or silent dual-write fallback. Prove recovery before
   using the new token path for entitled provider requests.
7. Rollback before ANY new remote token write: stop the new writer and explicitly restore
   the original adapter only if the frozen token is still valid. After ANY new write, the
   frozen file may be stale: keep service unavailable until the owner approves a private
   reconciliation/export of the latest authorized token or reauthorization. Never switch
   blindly to the old file, rewind revisions, delete the volume or revoke credentials.

## Tests actually run

`node --experimental-sqlite --test prototypes/encrypted-token-store/store.test.mjs`: **17 PASS**.
Coverage: encrypted disk/re-import recovery; create-only import; 12 competing writers;
two connections; request-state/rotation race; stale expiry; expiry/UNKNOWN/skew; ciphertext,
scope, key and revision tampering; higher-revision rollback; missing/old key; key rotation;
checkpoint rollback/deletion; quota/permission failures; bounded contention; legacy metadata;
lost acknowledgement; extractable/undersized keys and invalid clocks. No real credentials,
external endpoints or cloud resources were used. Node 26.7.0 locally; CI uses Node 22.

Next release is NO GO until the backend interface, hosting path, primary binding, independent
recovery/checkpoints, owner approvals and hosted synthetic recovery tests are all verified.
