import { describe, expect, it } from 'vitest'
import { mayAutoPrompt, safeDismissUntil, SUPPORT_AMOUNTS, SUPPORT_DISMISS_MS } from '../../app/components/support-logic'

describe('voluntary support popup eligibility', () => {
  it('offers only the approved amounts', () => {
    expect(SUPPORT_AMOUNTS).toEqual([10, 100, 500])
  })

  it('waits for time and engagement', () => {
    const base = { elapsed: true, engaged: true, dismissedUntil: 0, now: 1000, shownThisSession: false }
    expect(mayAutoPrompt(base)).toBe(true)
    expect(mayAutoPrompt({ ...base, elapsed: false })).toBe(false)
    expect(mayAutoPrompt({ ...base, engaged: false })).toBe(false)
  })

  it('suppresses auto prompts for 14 days and once per session', () => {
    expect(SUPPORT_DISMISS_MS).toBe(14 * 24 * 60 * 60 * 1000)
    const base = { elapsed: true, engaged: true, dismissedUntil: 2000, now: 1000, shownThisSession: false }
    expect(mayAutoPrompt(base)).toBe(false)
    expect(mayAutoPrompt({ ...base, now: 2000 })).toBe(true)
    expect(mayAutoPrompt({ ...base, dismissedUntil: 0, shownThisSession: true })).toBe(false)
  })

  it('treats invalid storage values as not dismissed', () => {
    expect(safeDismissUntil(null)).toBe(0)
    expect(safeDismissUntil('bad')).toBe(0)
    expect(safeDismissUntil('-1')).toBe(0)
    expect(safeDismissUntil('1760000000000')).toBe(1760000000000)
  })
})
