/**
 * Read a small administrative JSON request without calling request.text().
 *
 * Content-Length is only an early rejection hint: clients may omit or lie
 * about it. The actual streamed bytes are counted before each chunk is
 * retained; UTF-8 characters do not reduce the byte limit.
 */
export type BoundedBodyResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'too-large' | 'invalid' }

export async function readBoundedJsonBody(
  request: Pick<Request, 'headers' | 'body'>,
  maxBytes: number,
): Promise<BoundedBodyResult> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new Error('Invalid request byte cap')

  const declared = request.headers.get('content-length')
  if (declared !== null) {
    if (!/^(0|[1-9][0-9]*)$/.test(declared)) return { ok: false, reason: 'invalid' }
    const count = Number(declared)
    if (!Number.isSafeInteger(count)) return { ok: false, reason: 'too-large' }
    if (count > maxBytes) return { ok: false, reason: 'too-large' }
  }

  if (!request.body) return { ok: true, text: '' }

  const reader = request.body.getReader()
  const parts: Uint8Array[] = []
  let received = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!(value instanceof Uint8Array)) return { ok: false, reason: 'invalid' }
      if (value.byteLength > maxBytes - received) {
        // Stop pulling untrusted input once the absolute byte cap is crossed.
        await reader.cancel().catch(() => undefined)
        return { ok: false, reason: 'too-large' }
      }
      received += value.byteLength
      parts.push(value)
    }

    const bytes = new Uint8Array(received)
    let offset = 0
    for (const part of parts) {
      bytes.set(part, offset)
      offset += part.byteLength
    }
    return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) }
  } catch {
    return { ok: false, reason: 'invalid' }
  } finally {
    reader.releaseLock()
  }
}
