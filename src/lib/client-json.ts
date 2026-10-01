/** Bounded browser requests with cleanup and HTTP-error handling. */
export async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const abort = () => controller.abort()
  const timer = setTimeout(abort, 25_000)
  options.signal?.addEventListener('abort', abort, { once: true })
  if (options.signal?.aborted) abort()
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    const result = await response.json()
    if (!response.ok) throw new Error(typeof result?.error?.message === 'string' ? result.error.message : typeof result?.error === 'string' ? result.error : 'Data is temporarily unavailable. Please try again.')
    return result as T
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', abort)
  }
}
