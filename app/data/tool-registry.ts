import { Calculator, CreditCard, Fuel } from 'lucide-react'

export const PUBLIC_REVIEW_DATE = '10 Aug 2026'
export const PUBLIC_REVIEW_DATE_ISO = '2026-08-10'

export const publicTools = [
  {
    slug: 'credit-card-finder',
    title: 'Credit Card Finder',
    shortTitle: 'Card Finder',
    category: 'Card selection',
    icon: CreditCard,
    description:
      'Compare card fit around your spending pattern, reward structure, annual fee and practical restrictions.',
    href: '/tools/credit-card-finder',
    output: 'Spend-fit comparison',
    methodology: [
      'Start from the user’s spending pattern instead of a headline reward rate.',
      'Account for annual fee, reward caps and excluded categories where relevant.',
      'Treat issuer eligibility and merchant classification as variables that can change the result.',
    ],
  },
  {
    slug: 'cashback-calculator',
    title: 'Cashback Calculator',
    shortTitle: 'Cashback',
    category: 'Reward economics',
    icon: Calculator,
    description:
      'Estimate effective cashback after caps, excluded spending, annual fee and applicable taxes.',
    href: '/tools/cashback-calculator',
    output: 'Effective cashback rate',
    methodology: [
      'Separate eligible spending from excluded or non-rewarding categories.',
      'Apply the relevant cashback cap over the same period used for the comparison.',
      'Subtract annual fees and applicable taxes before describing a net annual benefit.',
    ],
  },
  {
    slug: 'fuel-card-optimizer',
    title: 'Fuel Card Optimizer',
    shortTitle: 'Fuel Optimizer',
    category: 'Fuel economics',
    icon: Fuel,
    description:
      'Estimate fuel reward value, surcharge-waiver value and practical annual savings without double-counting benefits.',
    href: '/tools/fuel-card-optimizer',
    output: 'Net annual fuel value',
    methodology: [
      'Keep surcharge waiver and reward earnings as separate benefit components.',
      'Apply transaction-range, outlet and monthly-ceiling conditions where they exist.',
      'Convert points into a realistic rupee value before combining them with other benefits.',
    ],
  },
] as const
