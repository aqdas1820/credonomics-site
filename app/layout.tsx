import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CredoNomics — Smarter Money Decisions',
  description: 'Tools, research and practical guides for credit cards, cashback, banking and investing in India.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
