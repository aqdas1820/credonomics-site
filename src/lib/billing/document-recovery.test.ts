import { mkdtemp, mkdir, open, readFile, copyFile, writeFile, unlink, rmdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { constants } from 'node:fs'
import { createHash } from 'node:crypto'
import { expect, it, vi } from 'vitest'
vi.mock('server-only', () => ({}))
import { archivedDocument, verifyArchivedDocument, type CreateOnlyArchiveStore } from './document-archive'
import { parseDocumentSnapshot, documentKey } from './document-snapshot'
import { renderDocumentPdf } from './document-pdf'

it('retains originals, recovers exact PDF from independent filesystem copy and rejects corrupt recovery', async () => {
  // Synthetic artifacts only. This script never opens a user backup or cloud.
  vi.stubEnv('BILLING_PDF_ARCHIVE_INTEGRITY_KEY', 'ab'.repeat(32))
  const root = await mkdtemp(join(tmpdir(), 'cn-synthetic-archive-drill-'))
  const id = '12345678-1234-4234-8234-123456789012'
  const snapshot = parseDocumentSnapshot('invoice', { id, invoiceNumber: 'CN-2026-00000001', customer: 'Synthetic recovery fixture', address: '', date: '2026-10-18', totalPaise: 100,
    items: [{ position: 0, description: 'Synthetic only', quantity: 1, ratePaise: 100, lineTotalPaise: 100 }] }, id)
  const key = documentKey(snapshot)
  const original = join(root, 'original'); const recovered = join(root, 'recovered')
  const pathFor = (base: string, name: string) => {
    const p = resolve(base, name); if (!p.startsWith(resolve(base) + sep)) throw new Error('Unsafe synthetic path'); return p
  }
  const adapter = (base: string): CreateOnlyArchiveStore => ({
    async read(name) { try { return await readFile(pathFor(base, name)) } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null; throw e } },
    async create(name, bytes) {
      const path = pathFor(base, name); await mkdir(dirname(path), { recursive: true })
      let file
      try { file = await open(path, 'wx', 0o600) } catch (e) { if ((e as NodeJS.ErrnoException).code === 'EEXIST') return 'exists'; throw e }
      try { await file.writeFile(bytes); await file.sync() } finally { await file.close() }
      return 'created'
    },
  })
  const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
  try {
    const first = await archivedDocument(adapter(original), snapshot, renderDocumentPdf)
    const retained = await readFile(pathFor(original, key)); const before = hash(retained)
    expect(await adapter(original).create(key, Buffer.from('overwrite refused'))).toBe('exists')
    await mkdir(dirname(pathFor(recovered, key)), { recursive: true })
    await copyFile(pathFor(original, key), pathFor(recovered, key), constants.COPYFILE_EXCL)
    const afterRestart = await archivedDocument(adapter(recovered), snapshot)
    expect(afterRestart.pdf.equals(first.pdf)).toBe(true)
    expect(afterRestart.sha256).toBe(first.sha256)
    expect(hash(await readFile(pathFor(original, key)))).toBe(before)
    await writeFile(pathFor(recovered, key), Buffer.from('corrupt synthetic recovery copy'))
    expect(() => verifyArchivedDocument(Buffer.from('corrupt'), snapshot)).toThrow()
    await expect(archivedDocument(adapter(recovered), snapshot)).rejects.toThrow()
    expect(hash(await readFile(pathFor(original, key)))).toBe(before)
  } finally {
    vi.unstubAllEnvs()
    for (const base of [original, recovered]) {
      await unlink(pathFor(base, key)).catch(() => undefined)
      await rmdir(join(base, id)).catch(() => undefined); await rmdir(base).catch(() => undefined)
    }
    await rmdir(root)
  }
}, 30000)
