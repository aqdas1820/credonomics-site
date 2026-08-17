export type CredoNomicsReport = {
  slug: string
  title: string
  shortTitle: string
  edition: string
  description: string
  category: string
  issueDate: string
  issueDateIso: string
  dataCutoff: string
  pages: number
  coverage: string
  reference: string
  preparedBy: string
  distribution: string
  pdfPath: string
  publicationDisclosure: string
  highlights: string[]
}

export const monthlyIndianEquityAug2026: CredoNomicsReport = {
  slug: 'monthly-indian-equity-opportunity-report-august-2026',
  title: 'Monthly Indian Equity Opportunity Report',
  shortTitle: 'Indian Equity Opportunity Report',
  edition: 'August 2026',
  description:
    'A 26-page monthly market-strategy publication covering 12 priority research ideas, event windows, ownership signals, catalyst checkpoints, risk controls and explicit thesis invalidation rules.',
  category: 'Indian Equities',
  issueDate: '16 August 2026',
  issueDateIso: '2026-08-16',
  dataCutoff: '14 August 2026 close',
  pages: 26,
  coverage: 'India listed equities - NSE/BSE',
  reference: 'CN-MEO-2026-0816-R1',
  preparedBy: 'CredoNomics Research Desk',
  distribution: 'Public educational market note',
  pdfPath:
    '/reports/credonomics-monthly-indian-equity-opportunity-report-august-2026.pdf',
  publicationDisclosure: "CredoNomics Investment Solutions is not registered with SEBI as a Research Analyst or Investment Adviser. As of the publication date, neither CredoNomics Investment Solutions nor the proprietor/author has any financial interest or beneficial holding in any company discussed in this report; no compensation, consideration or other benefit has been received from any such company or any third party in connection with this report; and no other material conflict of interest relating to the securities discussed is known to the publisher. This publication is issued solely for educational, informational and general market-research purposes and does not constitute personalized investment advice, a solicitation, or a recommendation to buy, sell or hold any security.",
  highlights: [
    '12 priority research ideas with evidence grades, risk levels and explicit invalidation rules',
    'August market-regime dashboard and opportunity-map framework',
    'Near-term catalyst and event timeline with post-event research actions',
    'Risk dashboard designed around what can break each thesis',
    'Monthly research checklist and implementation discipline',
    'Source register prioritising company, exchange, regulator and index-provider records',
  ],
}

export const reports: CredoNomicsReport[] = [monthlyIndianEquityAug2026]

export const latestReport = reports[0]