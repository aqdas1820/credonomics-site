import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Credit Card Finder',
  description: 'Compare credit-card fit around spending pattern, reward structure, fees and caps.',
  alternates: { canonical: '/tools/credit-card-finder' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
