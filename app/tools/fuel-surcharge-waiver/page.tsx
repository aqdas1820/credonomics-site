import type { Metadata } from 'next'
import Calculator from './Calculator'

export const metadata: Metadata = {
  title: 'Fuel Surcharge Waiver Calculator India',
  description: 'Estimate monthly and annual fuel surcharge waiver value using fuel spend, surcharge rate and waiver cap.',
  keywords: ['fuel surcharge waiver calculator India', 'fuel credit card calculator', 'fuel surcharge calculator'],
  alternates: { canonical: '/tools/fuel-surcharge-waiver' },
}

export default function Page() { return <Calculator /> }
