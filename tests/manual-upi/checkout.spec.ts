import {test,expect} from '@playwright/test'
import jsQR from 'jsqr'
import {PNG} from 'pngjs'
import {manualUpiHtml} from '../../src/lib/billing/manual-upi-html'
import type {ManualUpiConfig,ManualUpiView} from '../../src/lib/billing/manual-upi'
const id='11111111-1111-4111-8111-111111111111'
const config:ManualUpiConfig={origin:'https://www.credonomics.in',beneficiaryId:id,vpa:'synthetic@banktest',payee:'Synthetic Merchant',bankRef:'synthetic-account',fingerprint:'d'.repeat(64),signingKey:'ab'.repeat(32)}
const view:ManualUpiView={intentId:id,invoiceId:id,invoiceNumber:'CN-2026-00000001',amountPaise:12345,issuedAt:Date.now(),status:'UNPAID',bankVerified:false,vpa:config.vpa,payee:config.payee}
for(const width of [375,1280])test(`private checkout and decodable QR at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:850})
  const external:string[]=[];page.on('request',r=>external.push(r.url()))
  await page.setContent(await manualUpiHtml(view,config))
  await expect(page.getByRole('heading',{name:'Invoice payment'})).toBeVisible()
  await expect(page.getByText('UNPAID — bank verification pending.')).toBeVisible()
  const anchor=page.getByRole('link',{name:'Open UPI app'})
  const href=await anchor.getAttribute('href'),uri=new URL(href!)
  expect(uri.protocol).toBe('upi:');expect(uri.searchParams.get('pa')).toBe(config.vpa);expect(uri.searchParams.get('am')).toBe('123.45')
  const png=PNG.sync.read(await page.getByRole('img',{name:'UPI payment QR for the exact invoice amount'}).screenshot())
  const decoded=jsQR(new Uint8ClampedArray(png.data),png.width,png.height)
  expect(decoded?.data).toBe(href)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  expect(external).toEqual([])
})
test('paid view removes all payment instructions',async({page})=>{
  await page.setContent(await manualUpiHtml({...view,status:'PAID',bankVerified:true,vpa:undefined,payee:undefined},config))
  await expect(page.getByText('PAID — bank credit manually verified.')).toBeVisible()
  await expect(page.locator('svg')).toHaveCount(0);await expect(page.getByRole('link')).toHaveCount(0)
})
test('built Next.js refuses disabled public checkout and administrative writes',async({request})=>{
  expect((await request.get('/pay/upi/forged')).status()).toBe(404)
  expect((await request.post('/api/billing/admin/invoices/'+id+'/manual-upi',{data:{}})).status()).toBe(404)
  expect((await request.post('/api/billing/admin/invoices/'+id+'/manual-upi/reconcile',{data:{event:'SUCCESS'}})).status()).toBe(404)
})
