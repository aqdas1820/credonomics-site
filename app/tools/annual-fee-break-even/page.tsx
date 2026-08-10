import type { Metadata } from 'next'
import Calculator from './Calculator'

export const metadata: Metadata = {
  title: 'Credit Card Annual Fee Break-Even Calculator',
  description: 'Calculate the annual spend needed for a paid credit card to recover its annual fee through incremental rewards.',
  keywords: ['credit card annual fee break even', 'credit card fee calculator India', 'credit card rewards calculator'],
  alternates: { canonical: '/tools/annual-fee-break-even' },
}

export default function Page() { return <Calculator /> }
