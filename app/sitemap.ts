import type { MetadataRoute } from 'next'
import { researchArticles } from './data/research-articles'
import { cardCategories } from './data/card-categories'
import { quickCalculators } from './data/quick-calculators'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.credonomics.in'
  const routes = [
    '',
    '/tools',
    '/tools/credit-card-finder',
    '/tools/cashback-calculator',
    '/tools/fuel-card-optimizer',
    '/research',
    '/research/credit-card-data-standard',
    '/research/card-scoring',
    '/corrections',
    '/cards',
    '/cards/analyzer',
    '/cards/compare',
    '/methodology',
    '/about',
    '/disclosures',
    '/privacy',
    '/terms',
    '/contact',
  ]

  const pages = routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date('2026-08-10T00:00:00+05:30'),
    priority: route === '' ? 1 : route.startsWith('/tools/') ? 0.86 : 0.72,
  }))

  const calculators = quickCalculators.map((item) => ({
    url: `${base}/tools/${item.slug}`,
    lastModified: new Date('2026-08-10T00:00:00+05:30'),
    priority: 0.82,
  }))

  const categoryPages = cardCategories.map((category) => ({
    url: `${base}/cards/${category.slug}`,
    lastModified: new Date('2026-08-10T00:00:00+05:30'),
    priority: 0.84,
  }))

  const articles = researchArticles.map((article) => ({
    url: `${base}/research/articles/${article.slug}`,
    lastModified: new Date(article.reviewed + 'T00:00:00+05:30'),
    priority: 0.76,
  }))

  return [...pages, ...calculators, ...categoryPages, ...articles]
}
