export const SUPPORT_AMOUNTS = [10, 100, 500] as const

export type SupportAmount = (typeof SUPPORT_AMOUNTS)[number]

export const SUPPORT_DISMISS_MS = 14 * 24 * 60 * 60 * 1000
export const SUPPORT_DELAY_MS = 50 * 1000

export function mayAutoPrompt(options: {
  elapsed: boolean
  engaged: boolean
  dismissedUntil: number
  now: number
  shownThisSession: boolean
}): boolean {
  return options.elapsed &&
    options.engaged &&
    options.dismissedUntil <= options.now &&
    !options.shownThisSession
}

export function safeDismissUntil(value: string | null): number {
  if (!value) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}
