/** OAuth return paths stay on this site; never accept external/ambiguous URLs. */
export function safeAuthReturn(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return '/account'
  try {
    const target = new URL(value, 'https://www.credonomics.in')
    return target.origin === 'https://www.credonomics.in' ? target.pathname + target.search + target.hash : '/account'
  } catch { return '/account' }
}
