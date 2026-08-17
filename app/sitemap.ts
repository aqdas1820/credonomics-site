import type { MetadataRoute } from 'next'
import { researchArticles } from './data/research-articles'
import { cardCategories } from './data/card-categories'
import { quickCalculators } from './data/quick-calculators'
import { issuerRegistry } from './data/issuer-registry'
import { verifiedRealCards } from './data/verified-real-cards'
import { publicIpos } from './data/ipo-public'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.credonomics.in'
  const updated = new Date('2026-08-17T00:00:00+05:30')

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: updated, priority: 1 },
    { url: `${base}/cards`, lastModified: updated, priority: 0.95 },
    { url: `${base}/cards/all`, lastModified: updated, priority: 0.92 },
    { url: `${base}/cards/coverage`, lastModified: updated, priority: 0.9 },
    { url: `${base}/cards/compare`, lastModified: updated, priority: 0.86 },
    { url: `${base}/cards/analyzer`, lastModified: updated, priority: 0.8 },

    { url: `${base}/ipo`, lastModified: updated, priority: 0.9 },
    { url: `${base}/ipo/analyzer`, lastModified: updated, priority: 0.82 },
    { url: `${base}/ipo/methodology`, lastModified: updated, priority: 0.75 },
    { url: `${base}/ipo/documents`, lastModified: updated, priority: 0.83 },
    { url: `${base}/ipo/subscription`, lastModified: updated, priority: 0.82 },
    { url: `${base}/ipo/calendar`, lastModified: updated, priority: 0.82 },
    { url: `${base}/ipo/sme`, lastModified: updated, priority: 0.84 },
    { url: `${base}/ipo/mainboard`, lastModified: updated, priority: 0.84 },
    { url: `${base}/ipo/upcoming`, lastModified: updated, priority: 0.86 },
    { url: `${base}/ipo/current`, lastModified: updated, priority: 0.86 },

    { url: `${base}/tools`, lastModified: updated, priority: 0.84 },
    {
      url: `${base}/tools/mf-portfolio-tracker`,
      lastModified: updated,
      priority: 0.9,
    },

    { url: `${base}/research`, lastModified: updated, priority: 0.82 },
    { url: `${base}/methodology`, lastModified: updated, priority: 0.72 },
    { url: `${base}/about`, lastModified: updated, priority: 0.72 },
    { url: `${base}/official`, lastModified: updated, priority: 0.76 },
    { url: `${base}/disclosures`, lastModified: updated, priority: 0.68 },
    { url: `${base}/corrections`, lastModified: updated, priority: 0.68 },
    { url: `${base}/privacy`, lastModified: updated, priority: 0.55 },
    { url: `${base}/terms`, lastModified: updated, priority: 0.55 },
    { url: `${base}/contact`, lastModified: updated, priority: 0.68 },
  ]

  for (const category of cardCategories) {
    entries.push({
      url: `${base}/cards/${category.slug}`,
      lastModified: updated,
      priority: 0.9,
    })
  }

  for (const card of verifiedRealCards) {
    entries.push({
      url: `${base}/cards/${card.id}`,
      lastModified: new Date(`${card.verifiedAt}T00:00:00+05:30`),
      priority: 0.86,
    })
  }

  for (const ipo of publicIpos) {
    entries.push({
      url: `${base}/ipo/${ipo.slug}`,
      lastModified: new Date(ipo.lastUpdated),
      priority: 0.82,
    })
  }

  for (const issuer of issuerRegistry) {
    entries.push({
      url: `${base}/cards/issuer/${issuer.slug}`,
      lastModified: updated,
      priority: 0.68,
    })
  }

  for (const item of quickCalculators) {
    entries.push({
      url: `${base}/tools/${item.slug}`,
      lastModified: updated,
      priority: 0.8,
    })
  }

  for (const route of [
    '/tools/credit-card-finder',
    '/tools/cashback-calculator',
    '/tools/fuel-card-optimizer',
    '/research/credit-card-data-standard',
    '/research/card-scoring',
  ]) {
    entries.push({
      url: `${base}${route}`,
      lastModified: updated,
      priority: 0.8,
    })
  }

  for (const article of researchArticles) {
    entries.push({
      url: `${base}/research/articles/${article.slug}`,
      lastModified: new Date(`${article.reviewed}T00:00:00+05:30`),
      priority: 0.74,
    })
  }

  const unique = new Map(entries.map((entry) => [entry.url, entry]))
  return [...unique.values()]
}