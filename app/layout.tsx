import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.credonomics.in'),
  title: { default: 'CredoNomics Investment Solutions', template: '%s | CredoNomics' },
  description: 'Independent financial tools and research for credit cards, cashback, fuel economics, banking and mutual-fund portfolio analysis in India.',
  applicationName: 'CredoNomics',
  keywords: ['CredoNomics', 'credit card calculator India', 'cashback calculator', 'fuel card calculator', 'mutual fund portfolio tracker'],
  openGraph: {
    title: 'CredoNomics Investment Solutions',
    description: 'Financial tools that show the assumptions, fees and real-world outcome.',
    url: 'https://www.credonomics.in',
    siteName: 'CredoNomics',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
