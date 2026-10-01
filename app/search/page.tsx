import type { Metadata } from 'next'
import SiteFrame from '../components/SiteFrame'
import SearchWorkspace from './SearchWorkspace'

export const metadata: Metadata = {
  title: 'Search CredoNomics Intelligence',
  description:
    'Search CredoNomics research reports, IPO intelligence, mutual-fund research, cards and financial tools.',
  robots: {
    index: false,
    follow: true,
  },
}

export default async function SearchPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const searchParams = await searchParamsPromise
  return (
    <SiteFrame>
      <SearchWorkspace initialQuery={searchParams?.q ?? ''} />
    </SiteFrame>
  )
}