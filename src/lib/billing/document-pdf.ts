import 'server-only'
import 'regenerator-runtime/runtime'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { DocumentSnapshot } from './document-snapshot'

/** Local licensed fonts only; no browser, remote HTML, scripts or external URLs. */
export async function renderDocumentPdf(snapshot: DocumentSnapshot): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const fonts = await Promise.all(['NotoSans-Regular.ttf', 'NotoSansDevanagari-Regular.ttf'].map(async name =>
    doc.embedFont(await readFile(join(process.cwd(), 'assets/fonts', name)), { subset: true })))
  const glyphs = fonts.map(f => new Set(f.getCharacterSet()))
  const choose = (c: string) => {
    const index = glyphs.findIndex(set => Array.from(c).every(ch => set.has(ch.codePointAt(0)!)))
    if (index < 0) throw new Error('Unsupported document script; reviewed font required')
    return index
  }
  const d = snapshot.data
  const issued = new Date(snapshot.kind === 'invoice' ? snapshot.data.date + 'T00:00:00Z' : snapshot.data.issuedAt)
  doc.setCreationDate(issued); doc.setModificationDate(issued)
  doc.setTitle(snapshot.kind === 'invoice' ? `Invoice ${d.invoiceNumber}` : `Receipt ${snapshot.data.receiptNumber}`)
  doc.setProducer('CredoNomics document archive v1')
  const inr = (paise: number) => `INR ${(paise / 100).toFixed(2)}`
  const lines = ['CredoNomics Investment Solutions', snapshot.kind === 'invoice' ? 'ORIGINAL INVOICE - ISSUED UNPAID' : 'PAID RECEIPT - VERIFIED BANK CREDIT',
    `Invoice: ${d.invoiceNumber}`, `Customer: ${d.customer}`]
  if (snapshot.kind === 'invoice') {
    lines.push(`Issued: ${snapshot.data.date}`, `Address: ${snapshot.data.address}`)
    for (const l of snapshot.data.items) lines.push(`${l.position + 1}. ${l.description}`, `Quantity ${l.quantity} | Rate ${inr(l.ratePaise)} | Total ${inr(l.lineTotalPaise)}`)
    lines.push(`Original invoice total: ${inr(d.totalPaise)}`, 'This original invoice is not proof of payment.')
  } else {
    lines.push(`Receipt: ${snapshot.data.receiptNumber}`, `Issued: ${snapshot.data.issuedAt}`, `Invoice date: ${snapshot.data.invoiceDate}`,
      `Verified paid amount: ${inr(snapshot.data.paidPaise)}`)
    for (const c of snapshot.data.verifiedCredits) lines.push(`UTR ${c.utr} | ${inr(c.amountPaise)} | Booked ${c.bookedAt}`)
    lines.push('Full booked bank credit independently attested by an authorized operator.')
  }
  lines.push('Private document | Version 1 | No payment QR or checkout', 'Not digitally signed. Issuer and tax particulars require release approval.')
  let page = doc.addPage([595, 842]); let y = 798; let x = 40
  // Allocate a following page only when there is text to draw, not after the
  // final line (which could otherwise append a blank retained page).
  const newline = () => { x = 40; y -= 17 }
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
  const widths = new Map<string, number>()
  const width = (value: string, index: number) => {
    const key = index + ':' + value
    if (!widths.has(key)) widths.set(key, fonts[index].widthOfTextAtSize(value, 10))
    return widths.get(key)!
  }
  for (const line of lines) {
    let run = ''; let fontIndex = -1
    const flush = () => {
      if (!run) return
      if (y < 42) { page = doc.addPage([595, 842]); y = 798; x = 40 }
      page.drawText(run, { x, y, size: 10, font: fonts[fontIndex], color: rgb(0, 0, 0) })
      x += width(run, fontIndex); run = ''
    }
    for (const { segment } of segmenter.segment(line)) {
      if (segment === '\n' || segment === '\r\n') { flush(); newline(); continue }
      const index = choose(segment === '\t' ? ' ' : segment)
      const value = segment === '\t' ? ' ' : segment
      if (fontIndex !== index) { flush(); fontIndex = index }
      if (x + width(run + value, index) > 550) { flush(); newline() }
      run += value
    }
    flush(); newline()
  }
  return doc.save()
}
