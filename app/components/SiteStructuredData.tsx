import {
  BRAND_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '../seo/site'

export default function SiteStructuredData() {
  const instagramUrl =
    process.env.NEXT_PUBLIC_CREDONOMICS_INSTAGRAM_URL

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: BRAND_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/icon.png`,
        },
        description: SITE_DESCRIPTION,
        sameAs: instagramUrl ? [instagramUrl] : undefined,
        knowsAbout: [
          'Indian equity research',
          'IPO intelligence',
          'Mutual fund portfolio analysis',
          'Credit card economics',
          'Financial decision tools',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: BRAND_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: 'en-IN',
        publisher: {
          '@id': `${SITE_URL}/#organization`,
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph),
      }}
    />
  )
}