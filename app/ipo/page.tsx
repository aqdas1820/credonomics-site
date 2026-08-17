import type { Metadata } from 'next'
import SiteFrame from '../components/SiteFrame'
import IPODashboardClient from './IPODashboardClient'

export const metadata: Metadata = {
  title: 'IPO Intelligence Dashboard',
  description:
    'Track current and upcoming Indian IPOs, Mainboard and SME issues, price bands, important dates and CredoNomics primary-market research.',
  alternates: {
    canonical: '/ipo',
  },
  openGraph: {
    title: 'CredoNomics IPO Intelligence Dashboard',
    description:
      'Current IPOs, upcoming issues, Mainboard and SME research, calendars and primary-market intelligence.',
    url: '/ipo',
  },
}

export default function IPOPage() {
  const collectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'CredoNomics IPO Intelligence Dashboard',
    url: 'https://www.credonomics.in/ipo',
    description:
      'Indian IPO intelligence, current and upcoming public issues, Mainboard and SME research.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'CredoNomics',
      url: 'https://www.credonomics.in',
    },
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.credonomics.in/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'IPO Intelligence',
        item: 'https://www.credonomics.in/ipo',
      },
    ],
  }

  return (
    <SiteFrame>
      <IPODashboardClient />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPage),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs),
        }}
      />
    </SiteFrame>
  )
}