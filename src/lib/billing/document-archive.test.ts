import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { PDFDocument } from 'pdf-lib'
vi.mock('server-only', () => ({}))
import { archivedDocument, type CreateOnlyArchiveStore } from './document-archive'
import { parseDocumentSnapshot, documentKey } from './document-snapshot'
import { renderDocumentPdf } from './document-pdf'

const id = '12345678-1234-4234-8234-123456789012'
const input = { id, invoiceNumber: 'CN-2026-00000001', customer: 'Synthetic ग्राहक', address: 'Local test only', date: '2026-10-18',
  totalPaise: 150, status: 'UNPAID', paidPaise: 0, items: [{ position: 0, description: 'Test सेवा', quantity: 1, ratePaise: 150, lineTotalPaise: 150 }] }
const snapshot = () => parseDocumentSnapshot('invoice', input, id)
beforeEach(() => vi.stubEnv('BILLING_PDF_ARCHIVE_INTEGRITY_KEY', 'ab'.repeat(32)))
afterEach(() => vi.unstubAllEnvs())
function memoryStore() {
  const files = new Map<string, Uint8Array>()
  const store: CreateOnlyArchiveStore = {
    read: vi.fn(async key => files.get(key) ?? null),
    create: vi.fn(async (key, value) => { if (files.has(key)) return 'exists'; files.set(key, value); return 'created' }),
  }
  return { store, files }
}
describe('persistent create-only PDF archive contract', () => {
  it('generates a parseable PDF with embedded Latin and Devanagari fonts, then retrieves original bytes without rendering', async () => {
    const { store } = memoryStore(); const render = vi.fn(renderDocumentPdf)
    const first = await archivedDocument(store, snapshot(), render)
    expect((await PDFDocument.load(first.pdf)).getPageCount()).toBeGreaterThan(0)
    const retrieved = await archivedDocument(store, snapshot())
    expect(retrieved.sha256).toBe(first.sha256); expect(retrieved.pdf.equals(first.pdf)).toBe(true)
    expect(render).toHaveBeenCalledTimes(1); expect(store.create).toHaveBeenCalledTimes(1)
  })
  it('refuses missing archives on GET without creating a replacement', async () => {
    const { store } = memoryStore()
    await expect(archivedDocument(store, snapshot())).rejects.toThrow('not archived')
    expect(store.create).not.toHaveBeenCalled()
  })
  it('serializes same-key concurrent creation by verifying the persisted winner', async () => {
    const { store } = memoryStore()
    const result = await Promise.all([archivedDocument(store, snapshot(), renderDocumentPdf), archivedDocument(store, snapshot(), renderDocumentPdf)])
    expect(result[0].sha256).toBe(result[1].sha256)
  })
  it('detects modified PDF bytes and refuses to overwrite corruption', async () => {
    const { store, files } = memoryStore(); await archivedDocument(store, snapshot(), renderDocumentPdf)
    const key = documentKey(snapshot()); const value = JSON.parse(Buffer.from(files.get(key)!).toString())
    value.pdf = Buffer.from('%PDF-corrupted-content').toString('base64'); files.set(key, Buffer.from(JSON.stringify(value)))
    await expect(archivedDocument(store, snapshot(), renderDocumentPdf)).rejects.toThrow('integrity')
    expect(store.create).toHaveBeenCalledTimes(1)
  })
  it('rejects changed immutable snapshot instead of silently replacing the original', async () => {
    const { store } = memoryStore(); await archivedDocument(store, snapshot(), renderDocumentPdf)
    const changed = parseDocumentSnapshot('invoice', { ...input, customer: 'Changed' }, id)
    await expect(archivedDocument(store, changed, renderDocumentPdf)).rejects.toThrow('conflict')
  })
  it('rejects storage-only forgery even when the attacker recomputes the public PDF hash', async () => {
    const { store, files } = memoryStore(); await archivedDocument(store, snapshot(), renderDocumentPdf)
    const key = documentKey(snapshot()); const value = JSON.parse(Buffer.from(files.get(key)!).toString())
    const forged = Buffer.from('%PDF-1.7\n' + 'forged'.repeat(30) + '\n%%EOF')
    value.pdf = forged.toString('base64'); value.pdfSha256 = createHash('sha256').update(forged).digest('hex')
    files.set(key, Buffer.from(JSON.stringify(value)))
    await expect(archivedDocument(store, snapshot())).rejects.toThrow('integrity')
  })
  it('rejects missing or changed independent integrity key', async () => {
    const { store } = memoryStore(); await archivedDocument(store, snapshot(), renderDocumentPdf)
    vi.stubEnv('BILLING_PDF_ARCHIVE_INTEGRITY_KEY', '')
    await expect(archivedDocument(store, snapshot())).rejects.toThrow('key unavailable')
    vi.stubEnv('BILLING_PDF_ARCHIVE_INTEGRITY_KEY', 'cd'.repeat(32))
    await expect(archivedDocument(store, snapshot())).rejects.toThrow('integrity')
  })
  it('keeps original invoice bytes stable when current payment status changes', () => {
    expect(snapshot()).toEqual(parseDocumentSnapshot('invoice', { ...input, status: 'PAID', paidPaise: 150 }, id))
  })
  it('archives a distinct receipt only from a valid fully verified immutable snapshot', async () => {
    const paid = { invoiceId: id, invoiceNumber: input.invoiceNumber, receiptNumber: 'CN-R-2026-00000001', invoiceDate: input.date,
      issuedAt: '2026-10-18T12:00:00Z', customer: input.customer, version: 1, status: 'PAID', totalPaise: 150, paidPaise: 150,
      verifiedCredits: [{ utr: 'SYNTHETIC0001', amountPaise: 150, bookedAt: '2026-10-18T11:00:00Z' }] }
    const receipt = parseDocumentSnapshot('receipt', paid, id)
    const { store, files } = memoryStore()
    await archivedDocument(store, snapshot(), renderDocumentPdf)
    const result = await archivedDocument(store, receipt, renderDocumentPdf)
    expect((await PDFDocument.load(result.pdf)).getPageCount()).toBeGreaterThan(0)
    expect(files.size).toBe(2); expect(documentKey(receipt)).not.toBe(documentKey(snapshot()))
    for (const bad of [{ ...paid, paidPaise: 149 }, { ...paid, status: 'SUCCESS' }, { ...paid, version: 2 },
      { ...paid, verifiedCredits: [...paid.verifiedCredits, ...paid.verifiedCredits] }]) {
      expect(() => parseDocumentSnapshot('receipt', bad, id)).toThrow()
    }
  })
  it.each([
    { ...input, totalPaise: 151 }, { ...input, date: '2026-02-30' },
    { ...input, items: [{ ...input.items[0], position: 1 }] }, { ...input, customer: 'Bad\u0000text' },
  ])('rejects malformed or inconsistent authoritative snapshot', bad => expect(() => parseDocumentSnapshot('invoice', bad, id)).toThrow())
  it('rejects cross-invoice data and traversal identities', () => {
    expect(() => parseDocumentSnapshot('invoice', input, '87654321-1234-4234-8234-123456789012')).toThrow()
    expect(() => parseDocumentSnapshot('invoice', input, '../receipt')).toThrow()
  })
  it('paginates long lines without truncating and fails closed on unsupported script', async () => {
    const long = parseDocumentSnapshot('invoice', { ...input, items: Array.from({ length: 100 }, (_, position) => ({ ...input.items[0], position, description: 'Long description '.repeat(17) })), totalPaise: 15000 }, id)
    expect((await PDFDocument.load(await renderDocumentPdf(long))).getPageCount()).toBeGreaterThan(2)
    await expect(renderDocumentPdf(parseDocumentSnapshot('invoice', { ...input, customer: '测试' }, id))).rejects.toThrow('Unsupported')
  }, 30000)
  it('fails persistence errors and non-PDF renderer output closed', async () => {
    const { store } = memoryStore(); store.create = vi.fn(async () => { throw new Error('offline') })
    await expect(archivedDocument(store, snapshot(), renderDocumentPdf)).rejects.toThrow('offline')
    await expect(archivedDocument(store, snapshot(), async () => Buffer.from('not PDF'))).rejects.toThrow('integrity')
  })
})
