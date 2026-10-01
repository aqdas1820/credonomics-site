import SiteFrame from '../components/SiteFrame'
import { reports } from '../data/reports'
import ResearchDeskClient from './ResearchDeskClient'

export const metadata = {
  title: 'Research Desk',
  description:
    'CredoNomics research across equities and valuation, IPOs, mutual funds, banking and cards, supported by transparent methodology and source context.',
}

export default function ResearchPage() {
  return (
    <SiteFrame>
      <ResearchDeskClient reports={reports} />
    </SiteFrame>
  )
}
