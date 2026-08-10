import type { Metadata } from 'next'
import ToolTrustPanel from '../../components/ToolTrustPanel'

export const metadata: Metadata = {
  title: 'Fuel Card Optimizer',
  description: 'Estimate fuel-card reward value, surcharge waiver and practical annual savings.',
  alternates: { canonical: '/tools/fuel-card-optimizer' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolTrustPanel slug='fuel-card-optimizer' />
    </>
  )
}
