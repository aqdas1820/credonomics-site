import SiteFrame from '../../components/SiteFrame'
import { getPublicIpos } from '../../data/ipo-public'
import IPODashboardClient from '../IPODashboardClient'

export const metadata = {
  title: 'Current IPOs',
  description: 'Browse open and closing-today IPOs with date-validated CredoNomics market intelligence.',
  alternates: { canonical: '/ipo/current' },
}

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <SiteFrame>
      <IPODashboardClient records={getPublicIpos()} initialView="open"/>
    </SiteFrame>
  )
}
