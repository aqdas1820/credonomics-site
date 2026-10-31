import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { verifiedRealCards } from '../../app/data/verified-real-cards'

const client = readFileSync('app/cards/all/CardDirectory.tsx', 'utf8')
const css = readFileSync('app/cards/all/card-directory.module.css', 'utf8')
const page = readFileSync('app/cards/all/page.tsx', 'utf8')

describe('credit card review directory regression checks', () => {
  it('keeps all normalized cards available and uses actual issuer terms without false application CTAs', () => {
    expect(verifiedRealCards.length).toBeGreaterThan(20)
    expect(client).toContain('filtered.map(card =>')
    expect(client).toContain('card.sourceUrl')
    expect(client).toContain('Official issuer terms')
    expect(client).toContain('Important condition:')
    expect(client).not.toContain('Apply Now')
    expect(client).not.toContain('<b>Key benefit:</b>')
  })

  it('uses a bank filter instead of duplicating the global site navigation', () => {
    expect(client).toContain('BROWSE BY ISSUER')
    expect(client).toContain('Filter credit cards by bank')
    expect(client).toContain('Escape')
    expect(client).toContain('onPointer')
    expect(client).not.toContain('My Card Wallet</a>')
  })

  it('avoids invalid interactive buttons nested in a search input label', () => {
    expect(client).toContain('<div className={styles.search}>')
    expect(client).toContain('aria-label="Search card or bank"')
    expect(client).toContain('aria-label="Clear card search"')
    expect(client).not.toContain('<label className={styles.search}>')
  })

  it('isolates legible light-themed forms from forced dark global input and select styles', () => {
    expect(css).toContain('.directory .filterShell .search input')
    expect(css).toContain('background:transparent!important')
    expect(css).toContain('-webkit-text-fill-color:#162b45!important')
    expect(css).toContain('.directory .filterShell .filterRow label select')
    expect(css).toContain('background:#fff!important')
    expect(css).toContain('color-scheme:light!important')
    expect(css).toContain('.reviewCard{padding:27px 30px 23px')
  })

  it('leaves just one main landmark (from SiteFrame) in card reviews', () => {
    expect(page).not.toContain('<main className={styles.page}>')
    expect(page).toContain('<div className={styles.page}>')
  })
})
