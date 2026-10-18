import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
vi.mock('server-only', () => ({}))
import { privateDocumentStore } from './document-storage'
const getBucket = vi.fn(); const download = vi.fn(); const upload = vi.fn(); const from = vi.fn(() => ({ download, upload }))
const client = { storage: { getBucket, from } } as unknown as SupabaseClient
beforeEach(() => {
  vi.stubEnv('BILLING_PDF_ARCHIVE_BUCKET', 'synthetic-archive')
  getBucket.mockResolvedValue({ data: { public: false, file_size_limit: 2000000, allowed_mime_types: ['application/json'] }, error: null })
})
afterEach(() => { vi.resetAllMocks(); from.mockImplementation(() => ({ download, upload })); vi.unstubAllEnvs() })
describe('private persistent bucket adapter', () => {
  it('uses create-only upload with JSON envelope and no public URL', async () => {
    const store = await privateDocumentStore(client); upload.mockResolvedValue({ error: null })
    expect(await store.create('synthetic/key', Buffer.from('synthetic'))).toBe('created')
    expect(upload.mock.calls[0][2]).toEqual({ upsert: false, contentType: 'application/json', cacheControl: '0' })
  })
  it.each([{ public: true }, { file_size_limit: null }, { file_size_limit: 2000001 }, { allowed_mime_types: ['application/pdf'] }])('refuses unsafe bucket metadata', async bad => {
    const base = (await getBucket()).data
    getBucket.mockResolvedValue({ data: { ...base, ...bad }, error: null })
    await expect(privateDocumentStore(client)).rejects.toThrow('policy')
    expect(from).not.toHaveBeenCalled()
  })
  it('only treats genuine not-found as missing and conflict as existing', async () => {
    const store = await privateDocumentStore(client)
    download.mockResolvedValue({ error: { statusCode: '404' } }); expect(await store.read('key')).toBeNull()
    download.mockResolvedValue({ error: { statusCode: '403' } }); await expect(store.read('key')).rejects.toThrow('read unavailable')
    upload.mockResolvedValue({ error: { statusCode: '409' } }); expect(await store.create('key', Buffer.from('x'))).toBe('exists')
    upload.mockResolvedValue({ error: { statusCode: '500' } }); await expect(store.create('key', Buffer.from('x'))).rejects.toThrow('create unavailable')
  })
  it('reads persistent bytes via a newly constructed adapter instance', async () => {
    let persisted: Uint8Array | undefined
    upload.mockImplementation(async (_key, bytes) => { persisted = bytes; return { error: null } })
    download.mockImplementation(async () => ({ data: new Blob([new Uint8Array(persisted!)]), error: null }))
    await (await privateDocumentStore(client)).create('key', Buffer.from('synthetic persistent bytes'))
    expect(Buffer.from((await (await privateDocumentStore(client)).read('key'))!).toString()).toBe('synthetic persistent bytes')
  })
  it('fails oversized objects before materializing their data', async () => {
    const arrayBuffer = vi.fn(); download.mockResolvedValue({ data: { size: 2000001, arrayBuffer }, error: null })
    await expect((await privateDocumentStore(client)).read('key')).rejects.toThrow('size')
    expect(arrayBuffer).not.toHaveBeenCalled()
  })
})
