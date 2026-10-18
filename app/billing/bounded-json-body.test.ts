import { describe, expect, it } from 'vitest'
import { readBoundedJsonBody } from './bounded-json-body'

function request(chunks: Uint8Array[], contentLength?: string | null, onCancel?: () => void) {
  const headers = new Headers()
  if (contentLength != null) headers.set('content-length', contentLength)
  let readIndex = 0
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (readIndex === chunks.length) controller.close()
      else controller.enqueue(chunks[readIndex++])
    },
    cancel() { onCancel?.() },
  })
  return { headers, body }
}

const bytes = (text: string) => new TextEncoder().encode(text)

describe('bounded admin billing JSON reader', () => {
  it('accepts a valid JSON body within the byte cap without Content-Length', async () => {
    const raw = '{"note":"ok"}'
    expect(await readBoundedJsonBody(request([bytes(raw.slice(0, 5)), bytes(raw.slice(5))]), bytes(raw).length))
      .toEqual({ ok: true, text: raw })
  })

  it('accepts a body exactly at the byte cap', async () => {
    expect(await readBoundedJsonBody(request([bytes('123456')], '6'), 6))
      .toEqual({ ok: true, text: '123456' })
  })

  it('rejects oversized Content-Length before asking for the stream', async () => {
    const body = { getReader: () => { throw new Error('body must not be opened') } } as unknown as ReadableStream<Uint8Array>
    expect(await readBoundedJsonBody({ body, headers: new Headers({ 'content-length': '9000' }) }, 8192))
      .toEqual({ ok: false, reason: 'too-large' })
  })

  it('rejects a missing-length oversized stream and cancels it', async () => {
    let cancelled = false
    expect(await readBoundedJsonBody(request([bytes('12345'), bytes('678901')], null, () => { cancelled = true }), 10))
      .toEqual({ ok: false, reason: 'too-large' })
    expect(cancelled).toBe(true)
  })

  it('does not trust a declared length smaller than streamed bytes', async () => {
    expect(await readBoundedJsonBody(request([bytes('123456789')], '1'), 8))
      .toEqual({ ok: false, reason: 'too-large' })
  })

  it('counts multibyte UTF-8 by bytes, not JavaScript characters', async () => {
    expect(await readBoundedJsonBody(request([bytes('€')]), 2))
      .toEqual({ ok: false, reason: 'too-large' })
    expect(await readBoundedJsonBody(request([bytes('€')]), 3))
      .toEqual({ ok: true, text: '€' })
  })

  it('rejects malformed Content-Length, rather than treating it as zero', async () => {
    for (const invalid of ['NaN', '-1', '3, 3', '0x10', '1e3', '1.5']) {
      expect(await readBoundedJsonBody(request([bytes('{}')], invalid), 100))
        .toEqual({ ok: false, reason: 'invalid' })
    }
  })

  it('rejects unsafe integer lengths', async () => {
    expect(await readBoundedJsonBody(request([bytes('{}')], '999999999999999999999999999999'), 100))
      .toEqual({ ok: false, reason: 'too-large' })
  })

  it('rejects invalid UTF-8 rather than replacing invalid bytes', async () => {
    expect(await readBoundedJsonBody(request([new Uint8Array([0xff])]), 5))
      .toEqual({ ok: false, reason: 'invalid' })
  })

  it('handles empty and failed body streams without reading unbounded data', async () => {
    expect(await readBoundedJsonBody({ headers: new Headers(), body: null }, 10))
      .toEqual({ ok: true, text: '' })
    const broken = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error('disconnected')) } })
    expect(await readBoundedJsonBody({ headers: new Headers(), body: broken }, 10))
      .toEqual({ ok: false, reason: 'invalid' })
  })
})
