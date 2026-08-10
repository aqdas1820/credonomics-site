import type { MetadataRoute } from 'next'

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

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    priority: route === '' ? 1 : route.startsWith('/tools/') ? 0.85 : 0.7,
  }))
}
