import 'server-only'
import 'regenerator-runtime/runtime'
import { documentFontBytes } from './document-fonts'
import logoData from '../../../public/credonomics-mark.png?inline'
import { PDFDocument, degrees, rgb, type PDFPage } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { amountFor, type TestRecord } from './personal-model'

const navy = rgb(.025, .09, .16)
const teal = rgb(.02, .49, .51)
const gold = rgb(.83, .61, .23)
const muted = rgb(.34, .40, .44)
const pale = rgb(.95, .97, .97)
const white = rgb(1, 1, 1)

/** Server-only, local assets, no checkout links or accounting side effects. */
export async function personalPdf(record: TestRecord) {
  const totals = amountFor(record)
  if (totals.totalPaise !== record.totalPaise) throw new Error('Invalid TEST total')
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const fonts = await Promise.all(documentFontBytes().map(bytes => doc.embedFont(bytes, { subset: true })))
  const glyphs = fonts.map(font => new Set(font.getCharacterSet()))
  const logo = await doc.embedPng(Buffer.from(logoData.slice(logoData.indexOf(',')+1),'base64'))
  doc.setTitle(`TEST invoice ${record.number} - NOT VALID FOR PAYMENT`)
  doc.setSubject('Simulation only. No real invoice, bank settlement or paid receipt.')
  doc.setProducer('CredoNomics personal TEST workspace')
  const date = new Date(record.date + 'T00:00:00Z')
  doc.setCreationDate(date); doc.setModificationDate(date)
  const money = (paise: number) => 'INR ' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(paise / 100)
  const segments = (text: string) => Array.from(new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(text.replace(/\s+/g, ' ')), x => x.segment)
  const fontFor = (text: string) => {
    const index = glyphs.findIndex(set => Array.from(text).every(c => set.has(c.codePointAt(0)!)))
    if (index < 0) throw new Error('Unsupported script in TEST PDF')
    return fonts[index]
  }
  const runs = (text: string) => {
    const result: { text: string; font: typeof fonts[number] }[] = []
    for (const value of segments(text)) {
      const font = fontFor(value); const last = result.at(-1)
      if (last?.font === font) last.text += value
      else result.push({ text: value, font })
    }
    return result
  }
  const width = (text: string, size: number) => runs(text).reduce((sum, run) => sum + run.font.widthOfTextAtSize(run.text, size), 0)
  const wrap = (text: string, max: number, size: number) => {
    const lines: string[] = []; let line = ''
    for (const value of segments(text)) {
      if (line && width(line + value, size) > max) {
        const space = line.lastIndexOf(' ')
        if (space > 0) { lines.push(line.slice(0, space)); line = line.slice(space + 1) }
        else { lines.push(line); line = '' }
      }
      line += value
    }
    if (line.trim()) lines.push(line.trim())
    return lines
  }
  let page: PDFPage
  const text = (value: string, x: number, y: number, size = 10, color = navy, right = false) => {
    if (right) x -= width(value, size)
    for (const run of runs(value)) {
      page.drawText(run.text, { x, y, size, font: run.font, color })
      x += run.font.widthOfTextAtSize(run.text, size)
    }
  }
  const rule = (y: number) => page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: .6, color: rgb(.83, .88, .89) })
  const newPage = (continued = false) => {
    page = doc.addPage([595, 842])
    page.drawText('TEST', { x: 125, y: 265, size: 138, font: fonts[0], color: teal, opacity: .055, rotate: degrees(33) })
    page.drawRectangle({ x: 40, y: 746, width: 52, height: 52, color: white })
    page.drawImage(logo, { x: 43, y: 749, width: 46, height: 46 })
    text('CredoNomics', 105, 778, 23)
    text('INVESTMENT SOLUTIONS', 106, 759, 8, teal)
    page.drawRectangle({ x: 474, y: 766, width: 81, height: 27, color: navy })
    text('TEST COPY', 486, 775, 10, white)
    page.drawRectangle({ x: 40, y: 733, width: 515, height: 3, color: teal })
    text(continued ? 'TEST INVOICE / CONTINUED' : 'TEST INVOICE', 40, 703, 18)
    text(record.number, 555, 705, 10, muted, true)
    text('SIMULATION ONLY / NOT A TAX INVOICE', 40, 685, 8, muted)
    text('NOT VALID FOR PAYMENT', 555, 685, 8, muted, true)
    rule(60)
    text('No bank credit verified. No payment is due. No paid receipt has been issued.', 40, 44, 8, muted)
    text('CredoNomics / private owner TEST copy', 40, 28, 8, muted)
    return page
  }
  const tableHeader = (y: number) => {
    page.drawRectangle({ x: 40, y: y - 27, width: 515, height: 27, color: navy })
    text('#', 48, y - 17, 8, white); text('DESCRIPTION', 70, y - 17, 8, white)
    text('QTY', 350, y - 17, 8, white, true); text('RATE / INR', 444, y - 17, 8, white, true)
    text('AMOUNT / INR', 547, y - 17, 8, white, true)
    return y - 27
  }
  newPage()
  const customerLines = wrap(record.customer, 265, 10)
  const customerBottom = 664 - Math.max(65, customerLines.length * 12 + 30)
  page!.drawRectangle({ x: 40, y: customerBottom, width: 515, height: 664 - customerBottom, color: pale })
  text('TEST CUSTOMER', 52, 646, 8, muted)
  customerLines.forEach((line, i) => text(line, 52, 628 - i * 12, 10))
  text('DOCUMENT DATE', 345, 646, 8, muted); text(record.date, 543, 646, 9, navy, true)
  text('TEST STATE', 345, 626, 8, muted)
  text(record.status.replace('SIMULATED_', 'SIM. ').replaceAll('_', ' '), 543, 626, 8, teal, true)
  let y = tableHeader(customerBottom - 19)
  record.items.forEach((item, i) => {
    const lines = wrap(item.description, 225, 9)
    const height = Math.max(33, lines.length * 13 + 19)
    if (y - height < 82) { newPage(true); y = tableHeader(659) }
    if (i % 2 === 0) page.drawRectangle({ x: 40, y: y - height, width: 515, height, color: pale, opacity: .8 })
    text(String(i + 1), 48, y - 19, 9, muted)
    lines.forEach((line, n) => text(line, 70, y - 19 - n * 13, 9))
    text(item.quantity, 350, y - 19, 8.5, navy, true)
    const [rupees, fraction = ''] = item.rate.split('.')
    text(money(Number(rupees) * 100 + Number(fraction.padEnd(2, '0'))).slice(4), 444, y - 19, 8.5, navy, true)
    text(money(totals.linePaise[i]).slice(4), 547, y - 19, 8.5, navy, true)
    y -= height; rule(y)
  })
  if (y < 236) { newPage(true); y = 658 }
  page!.drawRectangle({ x: 300, y: y - 78, width: 255, height: 57, color: navy })
  text('TEST TOTAL', 312, y - 39, 8, rgb(.73, .84, .85))
  text(money(record.totalPaise), 543, y - 63, 16, white, true)
  page!.drawRectangle({ x: 40, y: y - 161, width: 515, height: 60, color: rgb(.99, .96, .88) })
  page!.drawRectangle({ x: 40, y: y - 161, width: 3, height: 60, color: gold })
  text('TEST DOCUMENT / NO REAL MONEY', 53, y - 120, 9)
  text('A simulated SUCCESS is not a bank settlement or a PAID receipt.', 53, y - 137, 9, muted)
  text('This is a personal practice ledger, not an accounting archive.', 53, y - 151, 8, muted)
  for (const [i, value] of doc.getPages().entries()) {
    page = value
    text(`Page ${i + 1} of ${doc.getPageCount()}`, 555, 28, 8, muted, true)
  }
  return doc.save()
}
