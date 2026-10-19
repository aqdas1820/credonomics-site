import 'server-only'
import 'regenerator-runtime/runtime'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { amountFor, type TestRecord } from './personal-model'

export async function personalPdf(record: TestRecord) {
  const doc = await PDFDocument.create(); doc.registerFontkit(fontkit)
  const fonts = await Promise.all(['NotoSans-Regular.ttf','NotoSansDevanagari-Regular.ttf'].map(async name => doc.embedFont(await readFile(join(process.cwd(),'assets/fonts',name)), { subset: true })))
  const glyphs=fonts.map(font=>new Set(font.getCharacterSet()))
  doc.setTitle(`TEST invoice ${record.number} - NOT VALID FOR PAYMENT`)
  doc.setSubject('Simulation only. No real invoice, bank settlement or paid receipt.')
  const totals = amountFor(record)
  const money = (paise: number) => `INR ${(paise / 100).toFixed(2)}`
  const lines = ['CredoNomics | PERSONAL TESTING', 'TEST INVOICE - NOT A TAX INVOICE', record.number,
    `Customer: ${record.customer}`, `Date: ${record.date}`, `TEST state: ${record.status}`,
    ...record.items.flatMap((line,i) => [`${i+1}. ${line.description}`, `Quantity ${line.quantity} | Rate ${line.rate} INR | Total ${money(totals.linePaise[i])}`]),
    `TEST TOTAL: ${money(record.totalPaise)}`, 'No bank credit verified. No payment is due. No paid receipt has been issued.']
  let page = doc.addPage([595,842]); let y = 755; let x = 40
  const heading = () => {
    page.drawText('TEST / SIMULATION - NOT VALID FOR PAYMENT', { x:40,y:800,size:12,font:fonts[0],color:rgb(.7,.18,.08) })
    page.drawText('Owner-only testing copy | No real settlement | CredoNomics', { x:40,y:24,size:9,font:fonts[0] })
  }
  heading()
  const nextLine = () => { x=40; y-=17; if(y<55){page=doc.addPage([595,842]);y=755;heading()} }
  for(const line of lines){
    for(const {segment} of new Intl.Segmenter('en',{granularity:'grapheme'}).segment(line)){
      const index=glyphs.findIndex(set=>Array.from(segment).every(c=>set.has(c.codePointAt(0)!)))
      if(index<0) throw new Error('Unsupported script in TEST PDF')
      const font=fonts[index]; const width=font.widthOfTextAtSize(segment,10)
      if(x+width>555) nextLine()
      page.drawText(segment,{x,y,size:10,font}); x+=width
    }
    nextLine()
  }
  return doc.save()
}
