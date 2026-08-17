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
    default: 'CredoNomics Investment Solutions | Financial Research & Decision Tools',
    template: '%s | CredoNomics',
  },
  description:
    'India-focused financial research for equities, IPO intelligence, mutual-fund portfolio analytics, credit-card economics and transparent decision tools.',
  applicationName: siteIdentity.alternateName,
  authors: [{ name: siteIdentity.alternateName, url: siteIdentity.canonicalUrl }],
  creator: siteIdentity.alternateName,
  publisher: siteIdentity.alternateName,
  keywords: [
    'CredoNomics',
    'CredoNomics Investment Solutions',
    'investment research India',
    'equity research India',
    'IPO analysis India',
    'IPO intelligence India',
    'mutual fund portfolio tracker India',
    'mutual fund holdings India',
    'financial tools India',
    'credit card comparison India',
    'credit card rewards India',
    'valuation research India',
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
    title: 'CredoNomics Investment Solutions',
    description:
      'Financial research, IPO intelligence, mutual-fund portfolio analytics and transparent decision tools for India.',
    url: siteIdentity.canonicalUrl,
    siteName: siteIdentity.alternateName,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'CredoNomics Investment Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CredoNomics Investment Solutions',
    description:
      'Financial research, IPO intelligence, mutual-fund analytics and practical decision tools for India.',
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
      name: siteIdentity.alternateName,
      alternateName: siteIdentity.name,
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
        'Indian equities',
        'equity valuation',
        'fundamental research',
        'initial public offerings',
        'mutual funds',
        'portfolio holdings analysis',
        'Indian credit cards',
        'credit card rewards',
        'cashback',
        'fuel credit cards',
        'financial product comparison',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteIdentity.canonicalUrl,
      name: siteIdentity.alternateName,
      alternateName: siteIdentity.name,
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