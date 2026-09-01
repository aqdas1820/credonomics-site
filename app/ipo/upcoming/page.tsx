import SiteFrame from '../../components/SiteFrame'
import { getPublicIpos } from '../../data/ipo-public'
import IPODashboardClient from '../IPODashboardClient'

export const metadata = {
  title: 'Upcoming IPOs',
  description: 'Browse future-dated IPOs with date-validated CredoNomics market intelligence.',
  alternates: { canonical: '/ipo/upcoming' },
}

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <SiteFrame>
      <IPODashboardClient records={getPublicIpos()} initialView="upcoming"/>
    </SiteFrame>
  )
}
