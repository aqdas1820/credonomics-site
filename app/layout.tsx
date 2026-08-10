import './globals.css'
import type { Metadata, Viewport } from 'next'
import {
  organizationId,
  siteIdentity,
  websiteId,
} from './data/site-identity'

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL(siteIdentity.canonicalUrl),
  title: {
    default: 'CredoNomics — Indian Credit Card Intelligence & Financial Tools',
    template: '%s | CredoNomics',
  },
  description:
    'Compare real Indian credit cards by spending profile, annual fees, reward caps and source-linked issuer terms.',
  applicationName: siteIdentity.name,
  authors: [{ name: siteIdentity.name, url: siteIdentity.canonicalUrl }],
  creator: siteIdentity.name,
  publisher: siteIdentity.name,
  keywords: [
    'CredoNomics',
    'CredoNomics India',
    'credit card comparison India',
    'best credit card calculator India',
    'cashback credit cards India',
    'fuel credit cards India',
    'travel credit cards India',
    'UPI credit cards India',
    'forex credit cards India',
    'credit card rewards calculator',
    'credit card annual fee calculator',
    'financial product research India',
  ],
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'CredoNomics — Indian Credit Card Intelligence & Financial Tools',
    description:
      'Compare real Indian credit cards using annual net value, category-specific calculations and source-linked issuer terms.',
    url: siteIdentity.canonicalUrl,
    siteName: siteIdentity.name,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'CredoNomics' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CredoNomics — Indian Credit Card Intelligence',
    description:
      'Real Indian credit-card rankings, category comparisons and source-linked issuer research.',
    images: ['/twitter-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'finance',
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f8fb' },
    { media: '(prefers-color-scheme: dark)', color: '#061321' },
  ],
}

const entityGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: siteIdentity.name,
      alternateName: siteIdentity.alternateName,
      url: siteIdentity.canonicalUrl,
      description: siteIdentity.description,
      logo: {
        '@type': 'ImageObject',
        url: siteIdentity.logoUrl,
        contentUrl: siteIdentity.logoUrl,
        width: 512,
        height: 512,
      },
      email: siteIdentity.email,
      telephone: siteIdentity.phoneInternational,
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
      sameAs: [siteIdentity.instagram],
      knowsAbout: [
        'Indian credit cards',
        'credit card rewards',
        'cashback',
        'fuel credit cards',
        'travel credit cards',
        'UPI credit cards',
        'foreign exchange markup',
        'financial product comparison',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteIdentity.canonicalUrl,
      name: siteIdentity.name,
      alternateName: siteIdentity.alternateName,
      description: siteIdentity.description,
      publisher: { '@id': organizationId },
      inLanguage: 'en-IN',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entityGraph) }}
        />
      </body>
    </html>
  )
}
