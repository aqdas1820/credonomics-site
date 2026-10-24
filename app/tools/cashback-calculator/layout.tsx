import type { Metadata } from 'next'
import SiteFrame from '../../components/SiteFrame'
import ToolTrustPanel from '../../components/ToolTrustPanel'

export const metadata: Metadata = {
  title: 'Cashback Calculator',
  description: 'Estimate effective cashback after caps, exclusions, annual fee and applicable taxes.',
  alternates: { canonical: '/tools/cashback-calculator' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SiteFrame>
      {children}
      <ToolTrustPanel slug='cashback-calculator' />
    </SiteFrame>
  )
}
