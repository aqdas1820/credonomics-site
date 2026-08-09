import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  const base='https://www.credonomics.in'
  return [
    '', '/research', '/tools/credit-card-finder', '/tools/cashback-calculator', '/tools/fuel-card-optimizer', '/tools/mf-portfolio-tracker'
  ].map(path=>({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path===''?'weekly':'monthly', priority: path===''?1:0.8 }))
}
