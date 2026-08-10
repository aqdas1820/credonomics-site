import type { MetadataRoute } from 'next'
import { researchArticles } from './data/research-articles'
import { cardCategories } from './data/card-categories'
import { quickCalculators } from './data/quick-calculators'
import { issuerRegistry } from './data/issuer-registry'
import { verifiedRealCards } from './data/verified-real-cards'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.credonomics.in'
  const updated = new Date('2026-08-10T00:00:00+05:30')

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: updated, priority: 1 },
    { url: `${base}/cards`, lastModified: updated, priority: 0.95 },
    { url: `${base}/cards/all`, lastModified: updated, priority: 0.92 },
    { url: `${base}/cards/coverage`, lastModified: updated, priority: 0.9 },
    { url: `${base}/cards/compare`, lastModified: updated, priority: 0.86 },
    { url: `${base}/cards/analyzer`, lastModified: updated, priority: 0.8 },
    { url: `${base}/tools`, lastModified: updated, priority: 0.82 },
    { url: `${base}/research`, lastModified: updated, priority: 0.78 },
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
    entries.push({ url: `${base}${route}`, lastModified: updated, priority: 0.8 })
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
