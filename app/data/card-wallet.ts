/** Only public product IDs are stored. Never store account or card numbers. */
export const CARD_WALLET_KEY = 'credonomics-card-wallet-v1'

export function parseWallet(raw: string | null, allowedIds: readonly string[]): string[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? '[]')
    if (!Array.isArray(parsed)) return []
    const allowed = new Set(allowedIds)
    return [...new Set(parsed.filter((id): id is string => typeof id === 'string' && allowed.has(id)))]
  } catch { return [] }
}
