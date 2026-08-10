import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cashback Calculator',
  description: 'Estimate effective cashback after caps, exclusions, annual fee and GST.',
  alternates: { canonical: '/tools/cashback-calculator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
