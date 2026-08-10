import type { Metadata } from 'next'
import Calculator from './Calculator'

export const metadata: Metadata = {
  title: 'Reward Point Value Calculator',
  description: 'Convert reward points to an estimated rupee value using your real redemption rate.',
  keywords: ['reward point value calculator India', 'credit card points calculator', 'reward points to rupees'],
  alternates: { canonical: '/tools/reward-point-value' },
}

export default function Page() { return <Calculator /> }
