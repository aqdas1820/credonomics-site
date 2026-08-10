import type { Metadata } from 'next'
import Calculator from './Calculator'

export const metadata: Metadata = {
  title: 'Cashback Cap Calculator',
  description: 'Calculate how a monthly cashback cap changes the effective cashback rate on eligible spending.',
  keywords: ['cashback cap calculator', '5 percent cashback calculator', 'cashback calculator India'],
  alternates: { canonical: '/tools/cashback-cap' },
}

export default function Page() { return <Calculator /> }
