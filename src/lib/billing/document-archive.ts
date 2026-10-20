import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { documentKey, parseDocumentSnapshot, snapshotId, type DocumentSnapshot } from './document-snapshot'

export const MAX_ARCHIVE_BYTES = 2_000_000
const digest = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex')
const envelope = z.object({ format: z.literal('credonomics-pdf-v1'), snapshot: z.unknown(), snapshotSha256: z.string().regex(/^[a-f0-9]{64}$/),
  pdfSha256: z.string().regex(/^[a-f0-9]{64}$/), pdf: z.string().min(1).max(MAX_ARCHIVE_BYTES),
  integrityTag: z.string().regex(/^[a-f0-9]{64}$/) }).strict()
function tag(snapshotSha256: string, pdfSha256: string) {
  const key = process.env.BILLING_PDF_ARCHIVE_INTEGRITY_KEY
  if (!key || !/^[a-f0-9]{64}$/i.test(key)) throw new Error('Archive integrity key unavailable')
  return createHmac('sha256', Buffer.from(key, 'hex')).update(`credonomics-pdf-v1:${snapshotSha256}:${pdfSha256}`).digest('hex')
}
export interface CreateOnlyArchiveStore {
  read(key: string): Promise<Uint8Array | null>
  create(key: string, bytes: Uint8Array): Promise<'created' | 'exists'>
}

function verify(bytes: Uint8Array, expected: DocumentSnapshot) {
  if (bytes.length > MAX_ARCHIVE_BYTES) throw new Error('Oversized archive')
  const stored = envelope.parse(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)))
  if (!timingSafeEqual(Buffer.from(stored.integrityTag, 'hex'), Buffer.from(tag(stored.snapshotSha256, stored.pdfSha256), 'hex'))) throw new Error('Archive integrity failure')
  const snapshot = parseDocumentSnapshot(expected.kind, (stored.snapshot as DocumentSnapshot)?.data, snapshotId(expected))
  if (JSON.stringify(snapshot) !== JSON.stringify(expected) || JSON.stringify(stored.snapshot) !== JSON.stringify(expected) ||
      stored.snapshotSha256 !== digest(JSON.stringify(expected))) throw new Error('Archive snapshot conflict')
  const pdf = Buffer.from(stored.pdf, 'base64')
  if (pdf.toString('base64') !== stored.pdf || pdf.length < 100 || !pdf.subarray(0, 5).equals(Buffer.from('%PDF-')) ||
      !pdf.subarray(-32).toString().includes('%%EOF') || digest(pdf) !== stored.pdfSha256) throw new Error('Archive integrity failure')
  return { pdf, sha256: stored.pdfSha256 }
}

/** No update/delete API. Existing content is always verified, never regenerated. */
export async function archivedDocument(store: CreateOnlyArchiveStore, snapshot: DocumentSnapshot,
  render?: (s: DocumentSnapshot) => Promise<Uint8Array>) {
  const key = documentKey(snapshot)
  const existing = await store.read(key)
  if (existing) return verify(existing, snapshot)
  if (!render) throw new Error('Document not archived')
  const pdf = await render(snapshot)
  const snapshotSha256 = digest(JSON.stringify(snapshot)); const pdfSha256 = digest(pdf)
  const bytes = Buffer.from(JSON.stringify({ format: 'credonomics-pdf-v1', snapshot,
    snapshotSha256, pdfSha256, pdf: Buffer.from(pdf).toString('base64'), integrityTag: tag(snapshotSha256, pdfSha256) }))
  verify(bytes, snapshot)
  await store.create(key, bytes) // concurrent create conflicts are verified below
  const persisted = await store.read(key)
  if (!persisted) throw new Error('Archive persistence unavailable')
  return verify(persisted, snapshot)
}
