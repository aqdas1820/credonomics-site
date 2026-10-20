# PDF archive implementation and limits

2026-10-18. Implemented in feature source, **disabled and not provisioned**.
No migration, new bucket/project, live customer data or paid service was used.

## Data flow

An allowlisted admin with server-verified identity and an own trusted
`app_metadata.billing_admin === true` claim may request a document only while API,
project-scope and `BILLING_PDF_ARCHIVE_ENABLED` gates pass. Same-origin POST to
`/api/billing/admin/invoices/[id]/documents/invoice` or `/receipt` creates the
archive if missing and returns the archived PDF; repeated POST retrieves the
original. GET only retrieves an existing archive. GET never regenerates it.
The private invoice/receipt UI offers this action only behind that disabled flag.
No untrusted PDF upload, public lookup, signed public URL or customer route exists.

Authoritative RPC results are validated and bound to the requested UUID before
storage access. Original invoice snapshots retain original customer/address/date,
lines and paise totals, always labeled issued UNPAID; later payment state is not
part of this immutable snapshot. PAID receipt snapshots have a separate number,
version and object key and require consistent full independently attested credits.
Gateway SUCCESS is never a receipt issuance authority. Existing RPC/SQL definitions
remain review-only and were not applied. Lazy archival at first authorized POST
does not prove every issued invoice has been archived: staging release verification
must reconcile all issued document IDs against archive objects and recovery copies.

PDF generation runs locally on the server with pinned pdf-lib/fontkit/runtime and
bundled unmodified OFL Noto fonts (see assets/fonts/README.md). It embeds fonts,
wraps/paginates text, supports Latin/Devanagari and fails closed on missing glyphs.
No remote browser/HTML/script/font request occurs. Other scripts require reviewed
fonts/layout coverage. Current PDF is not digitally signed and is not proof of
tax/legal compliance; issuer particulars still require owner review.

## Persistent storage and integrity

The Supabase adapter uses an **existing private** configured bucket only, verifies
its public flag, bounded file size and JSON MIME allowance, and uses create-only
upload (`upsert: false`). It never creates a bucket, updates, deletes or obtains a
public URL. An atomic versioned JSON envelope contains the exact PDF bytes in
base64, canonical authoritative snapshot, SHA-256 digests and an HMAC-SHA256 tag
binding both digests. This is deliberately one object so a crash cannot publish
a PDF/manifest pair from different attempts. Download decodes the persisted bytes;
it does not regenerate a PDF. Maximum envelope size is 2,000,000 bytes.

Concurrent creators verify the stored winner; conflicting snapshot, tampered
PDF/hash/tag, missing key, storage error or failed read-back yields a generic
unavailable response. A storage-only attacker cannot recompute the integrity tag
without the separate server key. Headers enforce private/no-store download,
attachment disposition, nosniff and restrictive CSP. Error bodies contain no
customer records, object paths, raw provider errors or keys. HTTP authentication
is rechecked on every request; no customer data/key is serialized to the button.

Required owner-local runtime configuration (names only):

- `BILLING_API_ENABLED` and reviewed exact-project binding, independently gated.
- `BILLING_PDF_ARCHIVE_ENABLED`: absent/default off; no value enabled by this work.
- `BILLING_PDF_ARCHIVE_BUCKET`: existing approved private bucket, not provisioned.
- `BILLING_PDF_ARCHIVE_INTEGRITY_KEY`: independent 32-byte random key represented
  as 64 hex characters, held only in approved server secret storage with independent
  private recovery. Never use a DB password, API key or example/test value. No key
  was generated/configured by this task. The tag is integrity authentication, not
  encryption or a legal digital signature.

## Immutability and recovery boundary

Application interfaces prohibit overwrite/delete and detect corruption. This is
**not certified WORM retention**: Supabase service-role/admin access can bypass RLS
and alter/delete objects, and an attacker controlling both application secrets and
storage could forge content. [Supabase storage access-control guidance](https://supabase.com/docs/guides/storage/security/access-control).
Provider/operator controls, least privilege, independent retention copies,
retention duration and deletion/legal-hold policy require real staging evidence.
The adapter cannot certify those controls from bucket metadata. Do not mark the
release `pdf_archive` gate VERIFIED from these source tests alone.

Independently retain the integrity key alongside secure recovery procedures but
separate access from the storage writer. Do not replace it casually: the current
v1 verifier requires the same key for retained archives, so an unplanned key change
makes existing archives fail verification. Future key-version migration needs a
reviewed dual-key verification/retention design, never rewriting originals.
Storage loss is not healed by regeneration: recover original envelopes privately
and verify identity, digest and tag, then test exact byte delivery on a separate
approved recovery environment. Database dumps do not include these file objects.

All automated storage operations in this task used mocked adapters/synthetic data.
Live persistence, bucket policies/overwrite denial, independent archive restore,
key recovery and hosted Auth/RLS remain **NOT RUN / BLOCKED**. The release remains
NO GO. Existing encrypted-volume synthetic recovery is not proof of PDF archive or
Supabase database recovery. No customer data, private backup or session file belongs
in GitHub/CI artifacts.
