import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    '/tools/mf-portfolio-tracker',
    '/data/mf-intelligence/',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow,
      },
    ],
    sitemap: 'https://www.credonomics.in/sitemap.xml',
    host: 'https://www.credonomics.in',
  }
}
