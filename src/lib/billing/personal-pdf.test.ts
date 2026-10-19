import { expect, it, vi } from 'vitest'
import { mkdir, writeFile } from 'node:fs/promises'
import { PDFDocument, PDFPage } from 'pdf-lib'
vi.mock('server-only', () => ({}))
import { personalPdf } from './personal-pdf'
import { applyTestCommand, type TestLedger } from './personal-model'
const owner = '25000000-0000-4000-8000-000000000001'
const id = '11111111-1111-4111-8111-111111111111'
const now = '2026-10-19T12:00:00.000Z'
const blank = (): TestLedger => ({ version: 1, owner, revision: 0, records: [] })
it('renders branded A4 item tables, complete long text, aligned INR totals and TEST markings on every page', async () => {
  const positions: { value: string; right: number; y: number }[] = []
  const original = PDFPage.prototype.drawText
  const spy = vi.spyOn(PDFPage.prototype, 'drawText').mockImplementation(function (this: PDFPage, value, options) {
    if (options?.font && options.size && options.x !== undefined && options.y !== undefined && options.size < 100) {
      positions.push({ value, right: options.x + options.font.widthOfTextAtSize(value, options.size), y: options.y })
    }
    return original.call(this, value, options)
  })
  try {
    const draft = { customer: 'Synthetic Customer', date: '2026-10-19', items: [
      { description: 'Synthetic strategy session', quantity: '2', rate: '1234.50' },
      { description: 'Synthetic follow-up', quantity: '1', rate: '250.00' },
    ] }
    let ledger = applyTestCommand(blank(), { action: 'save', draft }, id, now)
    for (const status of ['ISSUED_TEST', 'SIMULATED_PENDING', 'SIMULATED_SUCCESS']) ledger = applyTestCommand(ledger, { action: 'transition', id, status }, id, now)
    const standard = await personalPdf(ledger.records[0])
    const parsed = await PDFDocument.load(standard)
    expect(parsed.getPageCount()).toBe(1)
    expect(positions.find(x => x.value === '2,469.00')?.right).toBeCloseTo(547)
    expect(positions.find(x => x.value === 'INR 2,719.00')?.right).toBeCloseTo(543)
    const boundaryDraft = { ...draft, customer: 'W'.repeat(120), items: Array.from({ length: 20 }, (_, i) => ({
      description: (`Boundary item ${i + 1}: ` + 'complete synthetic description '.repeat(12)).slice(0, 300),
      quantity: i === 0 ? '2147483647' : '1', rate: i === 19 ? '100000000.00' : '0',
    })) }
    const boundaryRecord = applyTestCommand(blank(), { action: 'save', draft: boundaryDraft }, id, now).records[0]
    const boundary = await personalPdf(boundaryRecord)
    const pages = (await PDFDocument.load(boundary)).getPages()
    expect(pages.length).toBeGreaterThan(1)
    for (const page of pages) { expect(page.getSize()).toEqual({ width: 595, height: 842 }); expect(page.node.Annots()?.size() ?? 0).toBe(0) }
    expect(positions.filter(x => x.value === 'TEST COPY').length).toBe(pages.length + 1)
    expect(positions.every(x => x.right <= 556 && x.y >= 27 && x.y <= 800)).toBe(true)
    if (process.env.PERSONAL_PDF_FIXTURES === '1') {
      await mkdir('artifacts/phase26-pdf', { recursive: true })
      await writeFile('artifacts/phase26-pdf/standard-TEST.pdf', standard)
      await writeFile('artifacts/phase26-pdf/boundary-TEST.pdf', boundary)
    }
    await expect(personalPdf({ ...boundaryRecord, totalPaise: 1 })).rejects.toThrow('Invalid TEST total')
  } finally { spy.mockRestore() }
}, 60000)
