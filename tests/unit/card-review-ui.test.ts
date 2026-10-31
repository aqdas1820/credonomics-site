import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { verifiedRealCards } from '../../app/data/verified-real-cards'

const client = readFileSync('app/cards/all/CardDirectory.tsx', 'utf8')
const css = readFileSync('app/cards/all/card-directory.module.css', 'utf8')
const page = readFileSync('app/cards/all/page.tsx', 'utf8')
const layout = readFileSync('app/cards/all/review-page.module.css', 'utf8')
const artwork = readFileSync('app/cards/components/card-artwork.module.css', 'utf8')

describe('credit card review directory design and safety regression checks', () => {
  it('keeps real card records and official issuer CTA without invented approvals or ratings', () => {
    expect(verifiedRealCards.length).toBeGreaterThan(20)
    expect(client).toContain('filtered.map(card =>')
    expect(client).toContain('card.sourceUrl')
    expect(client).toContain('Official issuer terms')
    expect(client).toContain('Important condition:')
    expect(client).not.toContain('Apply Now')
    expect(client).not.toContain('<b>Key benefit:</b>')
  })

  it('preserves bank filtering, keyboard dismissal and card comparison affordances', () => {
    expect(client).toContain('BROWSE BY ISSUER')
    expect(client).toContain('Filter credit cards by bank')
    expect(client).toContain('Escape')
    expect(client).toContain('onPointer')
    expect(client).toContain('buildDirectoryCompareLink')
    expect(client).not.toContain('My Card Wallet</a>')
  })

  it('keeps the search button separate from input labels', () => {
    expect(client).toContain('<div className={styles.search}>')
    expect(client).toContain('aria-label="Search card or bank"')
    expect(client).toContain('aria-label="Clear card search"')
    expect(client).not.toContain('<label className={styles.search}>')
  })

  it('uses the existing Midnight Intelligence tokens instead of a forced white review theme', () => {
    for (const token of ['--cn-bg','--cn-text','--cn-muted','--cn-border','--cn-cyan']) {
      expect(css + layout).toContain('var(' + token + ')')
    }
    expect(layout).toContain('var(--cn-bg)')
    expect(css).toContain('--surface:var(--cn-surface)')
    expect(css).toContain('background:var(--surface)')
    expect(css).not.toContain('background:#fff')
    expect(layout).not.toContain('background:#f8fafc')
    expect(layout).not.toContain('color-scheme:light')
    expect(artwork).toContain('background:var(--cn-surface-raised)')
  })

  it('isolates input and select overrides to the card directory without breaking dark or light modes', () => {
    expect(css).toContain('.directory .filterShell .search input')
    expect(css).toContain('background:transparent!important')
    expect(css).toContain('-webkit-text-fill-color:var(--ink)!important')
    expect(css).toContain('.directory .filterShell .filterRow label select')
    expect(css).toContain('background:var(--raised)!important')
    expect(css).toContain('color-scheme:normal!important')
    expect(css).not.toContain('color-scheme:light!important')
  })

  it('preserves one semantic main landmark from SiteFrame', () => {
    expect(page).not.toContain('<main className={styles.page}>')
    expect(page).toContain('<div className={styles.page}>')
  })

  it('includes mobile and reduced-motion treatments', () => {
    expect(css).toContain('@media(max-width:640px)')
    expect(css).toContain('@media(max-width:420px)')
    expect(css).toContain('@media(prefers-reduced-motion:reduce)')
    expect(layout).toContain('@media(max-width:760px)')
  })
})
