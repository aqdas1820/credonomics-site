import type { MetadataRoute } from 'next'
import { researchArticles } from './data/research-articles'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.credonomics.in'
  const routes = [
    '',
    '/tools',
    '/tools/credit-card-finder',
    '/tools/cashback-calculator',
    '/tools/fuel-card-optimizer',
    '/research',
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
    priority: route === '' ? 1 : route.startsWith('/tools/') ? 0.85 : 0.7,
  }))

  const articles = researchArticles.map((article) => ({
    url: `${base}/research/articles/${article.slug}`,
    lastModified: new Date(article.reviewed + 'T00:00:00+05:30'),
    priority: 0.75,
  }))

  return [...pages, ...articles]
}
