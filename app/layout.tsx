import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.credonomics.in'),
  title: {
    default: 'CredoNomics Investment Solutions',
    template: '%s | CredoNomics',
  },
  description:
    'Independent financial research and decision tools for credit cards, cashback, fuel economics and banking products in India.',
  applicationName: 'CredoNomics',
  keywords: [
    'CredoNomics',
    'financial tools India',
    'credit card finder India',
    'cashback calculator India',
    'fuel card calculator India',
    'credit card rewards calculator',
    'financial product research India',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CredoNomics Investment Solutions',
    description:
      'Financial research and decision tools that make fees, caps, exclusions and real-world product value easier to understand.',
    url: 'https://www.credonomics.in',
    siteName: 'CredoNomics',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CredoNomics Investment Solutions',
    description:
      'Independent financial research and decision tools for India.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  )
}
