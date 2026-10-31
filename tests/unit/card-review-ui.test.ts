import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import CardDirectory from '../../app/cards/all/CardDirectory'
import { categoriesForCard, categoryLabel } from '../../app/data/card-intelligence'
import { verifiedRealCards } from '../../app/data/verified-real-cards'

const cards = verifiedRealCards.map(card => ({
  ...card,
  categories: categoriesForCard(card).map(slug => ({ slug, label: categoryLabel(slug) })),
}))
const issuers = [...new Set(cards.map(card => card.issuer))].sort()

describe('credit card review directory UI regression checks', () => {
  it('renders every normalized credit card with source-based metrics and no fabricated application CTA', () => {
    const html = renderToStaticMarkup(createElement(CardDirectory, { cards, issuers }))
    expect((html.match(/<article\b/g) || []).length).toBe(verifiedRealCards.length)
    expect(html).toContain('Official issuer terms')
    expect(html).toContain('Important condition:')
    expect(html).toContain('Search card or bank')
    expect(html).not.toContain('Apply Now')
    expect(html).not.toContain('Key benefit:')
  })

  it('avoids duplicate navigation and invalid nested interactive labels', () => {
    const html = renderToStaticMarkup(createElement(CardDirectory, { cards, issuers }))
    expect(html).toContain('BROWSE BY ISSUER')
    expect(html).not.toContain('My Card Wallet')
    const searchArea = html.match(/aria-label="Search card or bank"[^>]*>/)?.[0] || ''
    expect(searchArea).toContain('type="search"')
  })

  it('overrides global forced dark inputs only within the review directory', () => {
    const css = readFileSync('app/cards/all/card-directory.module.css', 'utf8')
    expect(css).toContain('.directory .filterShell .search input')
    expect(css).toContain('background:transparent!important')
    expect(css).toContain('-webkit-text-fill-color:#162b45!important')
    expect(css).toContain('.directory .filterShell .filterRow label select')
    expect(css).toContain('background:#fff!important')
    expect(css).toContain('color-scheme:light!important')
  })

  it('uses one main landmark from SiteFrame rather than nesting a second main', () => {
    const page = readFileSync('app/cards/all/page.tsx', 'utf8')
    expect(page).not.toContain('<main className={styles.page}>')
    expect(page).toContain('<div className={styles.page}>')
  })
})
