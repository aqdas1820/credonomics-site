import type { Metadata } from 'next'
import {
  OFFICIAL_PAGE_DESCRIPTION,
  OFFICIAL_PAGE_TITLE,
} from '../seo/site'

export const metadata: Metadata = {
  title: OFFICIAL_PAGE_TITLE,
  description: OFFICIAL_PAGE_DESCRIPTION,
  alternates: {
    canonical: '/official',
  },
  openGraph: {
    title: OFFICIAL_PAGE_TITLE,
    description: OFFICIAL_PAGE_DESCRIPTION,
    url: '/official',
  },
}

export default function OfficialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}