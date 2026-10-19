import { createServer, type Server } from 'node:http'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'
vi.mock('server-only', () => ({}))
import { privateDocumentStore } from './document-storage'
let server: Server
let origin: string
const objects = new Map<string, Buffer>()
let mode: 'private' | 'missing-bucket' | 'denied' | 'public' = 'private'
let uploads = 0
beforeEach(async () => {
  vi.stubEnv('BILLING_PDF_ARCHIVE_BUCKET', 'synthetic-archive')
  objects.clear(); mode = 'private'; uploads = 0
  server = createServer(async (req, res) => {
    const json = (status: number, value: unknown) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(value)) }
    if (mode === 'denied') return json(403, { statusCode: '403', code: 'AccessDenied', message: 'Synthetic denial' })
    if (req.url === '/storage/v1/bucket/synthetic-archive') {
      if (mode === 'missing-bucket') return json(404, { statusCode: '404', code: 'NoSuchBucket', message: 'Synthetic missing bucket' })
      return json(200, { id: 'synthetic-archive', public: mode === 'public', file_size_limit: 2000000, allowed_mime_types: ['application/json'] })
    }
    const key = req.url!.replace('/storage/v1/object/authenticated/', '').replace('/storage/v1/object/', '')
    if (req.method === 'GET') {
      const bytes = objects.get(key)
      if (!bytes) return json(404, { statusCode: '404', code: 'NoSuchKey', message: 'Synthetic missing object' })
      res.writeHead(200, { 'content-type': 'application/json' }); res.end(bytes); return
    }
    if (req.method === 'POST') {
      uploads++
      if (req.headers['x-upsert'] !== 'false') return json(400, { statusCode: '400', code: 'InvalidRequest', message: 'Overwrite refused' })
      if (objects.has(key)) return json(400, { statusCode: '400', code: 'ResourceAlreadyExists', message: 'Asset Already Exists' })
      const parts: Buffer[] = []; for await (const part of req) parts.push(Buffer.from(part))
      objects.set(key, Buffer.concat(parts)); return json(200, { Key: key })
    }
    json(405, {})
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('Loopback unavailable')
  origin = `http://127.0.0.1:${address.port}`
})
afterEach(async () => { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); vi.unstubAllEnvs() })
const client = () => createClient(origin, 'synthetic-test-only-not-a-credential', { auth: { persistSession: false, autoRefreshToken: false } })
describe('installed Supabase SDK against loopback Storage HTTP contract', () => {
  it('persists exact bytes and recognizes HTTP 400 duplicate code without overwrite', async () => {
    const key = '12345678-1234-4234-8234-123456789012/invoice-v1.json'
    const store = await privateDocumentStore(client()); expect(await store.read(key)).toBeNull()
    expect(await store.create(key, Buffer.from('synthetic original'))).toBe('created')
    expect(await store.create(key, Buffer.from('different'))).toBe('exists')
    expect(Buffer.from((await (await privateDocumentStore(client())).read(key))!).toString()).toBe('synthetic original')
    expect(uploads).toBe(2)
  })
  it.each(['missing-bucket', 'denied', 'public'] as const)('fails %s without writes or bucket creation', async failure => {
    mode = failure; await expect(privateDocumentStore(client())).rejects.toThrow('policy'); expect(uploads).toBe(0)
  })
  it('fails permission loss after initialization without classifying it as missing', async () => {
    const store = await privateDocumentStore(client()); mode = 'denied'
    await expect(store.read('key')).rejects.toThrow('read unavailable')
    await expect(store.create('key', Buffer.from('synthetic'))).rejects.toThrow('create unavailable')
  })
})
