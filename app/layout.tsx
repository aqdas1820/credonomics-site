import './globals.css'
import type { Metadata, Viewport } from 'next'

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL('https://www.credonomics.in'),
  title: {
    default: 'CredoNomics — Financial Research & Decision Tools for India',
    template: '%s | CredoNomics',
  },
  description:
    'Independent India-focused financial research and decision tools for credit cards, cashback, fuel economics and banking product terms.',
  applicationName: 'CredoNomics',
  authors: [{ name: 'CredoNomics Investment Solutions' }],
  creator: 'CredoNomics Investment Solutions',
  publisher: 'CredoNomics Investment Solutions',
  keywords: [
    'CredoNomics',
    'financial tools India',
    'credit card finder India',
    'cashback calculator India',
    'fuel card calculator India',
    'credit card rewards calculator',
    'financial product research India',
    'cashback cap calculator',
    'fuel surcharge waiver calculator India',
    'credit card annual fee break even calculator',
    'reward point value calculator',
    'banking product comparison India',
  ],
  alternates: { canonical: '/' },
  icons: {
    icon: '/credonomics-mark.png',
    apple: '/credonomics-mark.png',
  },
  openGraph: {
    title: 'CredoNomics — Financial Research & Decision Tools for India',
    description:
      'Understand the fine print and quantify the real value of credit cards, cashback, fuel and banking products.',
    url: 'https://www.credonomics.in',
    siteName: 'CredoNomics',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CredoNomics — Financial Research & Decision Tools',
    description: 'India-focused financial research and calculators.',
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

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CredoNomics Investment Solutions',
  alternateName: 'CredoNomics',
  url: 'https://www.credonomics.in',
  logo: 'https://www.credonomics.in/credonomics-mark.png',
  sameAs: ['https://www.instagram.com/credonomics.in/'],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-2562-455327',
    email: 'hello@credonomics.in',
    contactType: 'customer support',
    areaServed: 'IN',
    availableLanguage: ['en'],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CredoNomics',
  url: 'https://www.credonomics.in',
  description: 'India-focused financial research and decision tools.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </body>
    </html>
  )
}
