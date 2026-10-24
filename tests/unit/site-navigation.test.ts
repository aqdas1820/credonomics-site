import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { siteSections, sectionForPath, activeSectionLink } from '../../app/data/site-navigation'

describe('shared site information architecture', () => {
  it('resolves the most specific section across legacy route boundaries', () => {
    expect(sectionForPath('/tools/mf-portfolio-tracker')?.id).toBe('funds')
    expect(sectionForPath('/tools/cashback-cap')?.id).toBe('tools')
    expect(sectionForPath('/stocks/NSE/RELIANCE')?.id).toBe('markets')
    expect(sectionForPath('/reports/monthly-indian-equity-opportunity-report-august-2026')?.id).toBe('research')
    expect(sectionForPath('/updates/2026-10')?.id).toBe('research')
    expect(sectionForPath('/cards/wallet')?.id).toBe('cards')
    expect(sectionForPath('/cardsomething')).toBeUndefined()
    expect(sectionForPath('/')).toBeUndefined()
  })
  it('gives each curated destination one owner and a real supported route', () => {
    const links = siteSections.flatMap(section => section.links)
    expect(new Set(links.map(link => link.href)).size).toBe(links.length)
    for (const section of siteSections) {
      expect(section.links.some(link => link.href === section.href)).toBe(true)
      for (const link of section.links) {
        expect(sectionForPath(link.href)?.id).toBe(section.id)
        const isCardCategory = /^\/cards\/[^/]+$/.test(link.href) && !['/cards/all','/cards/compare','/cards/wallet','/cards/analyzer'].includes(link.href)
        expect(existsSync(`app${link.href}/page.tsx`) || isCardCategory && existsSync('app/cards/[slug]/page.tsx')).toBe(true)
      }
    }
  })
  it('highlights the deepest matching destination, not every parent link', () => {
    const cards = sectionForPath('/cards/wallet')!
    expect(activeSectionLink('/cards/wallet', cards)).toBe('/cards/wallet')
    expect(activeSectionLink('/cards/issuer/axis-bank', cards)).toBe('/cards')
  })
})
