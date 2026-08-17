import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mutual Fund Portfolio Intelligence',
  description:
    'Explore mutual-fund scheme holdings, stock concentration, sector exposure and portfolio-change intelligence on CredoNomics.',
  alternates: {
    canonical: '/tools/mf-portfolio-tracker',
  },
}

export default function MutualFundPortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}