import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { MAX_ARCHIVE_BYTES, type CreateOnlyArchiveStore } from './document-archive'

/** Existing private bucket only. Never provisions a resource or uses upsert. */
export async function privateDocumentStore(client: SupabaseClient): Promise<CreateOnlyArchiveStore> {
  const bucket = process.env.BILLING_PDF_ARCHIVE_BUCKET
  if (!bucket || !/^[a-z0-9][a-z0-9-]{2,62}$/.test(bucket)) throw new Error('Private archive not configured')
  const { data, error } = await client.storage.getBucket(bucket)
  if (error || !data || data.public !== false || !data.file_size_limit || Number(data.file_size_limit) > MAX_ARCHIVE_BYTES ||
      !data.allowed_mime_types?.includes('application/json')) throw new Error('Private archive policy unavailable')
  const objects = client.storage.from(bucket)
  return {
    async read(key) {
      const { data: file, error: failure } = await objects.download(key)
      if (failure) {
        if (String((failure as { statusCode?: string }).statusCode) === '404') return null
        throw new Error('Archive read unavailable')
      }
      if (!file || file.size > MAX_ARCHIVE_BYTES) throw new Error('Archive size unavailable')
      return new Uint8Array(await file.arrayBuffer())
    },
    async create(key, bytes) {
      if (bytes.length > MAX_ARCHIVE_BYTES) throw new Error('Archive exceeds cap')
      const { error: failure } = await objects.upload(key, bytes, { upsert: false, contentType: 'application/json', cacheControl: '0' })
      if (!failure) return 'created'
      if (String((failure as { statusCode?: string }).statusCode) === '409') return 'exists'
      throw new Error('Archive create unavailable')
    },
  }
}
