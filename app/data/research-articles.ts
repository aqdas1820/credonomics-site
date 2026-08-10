export const RESEARCH_REVIEW_DATE = '10 Aug 2026'
export const RESEARCH_REVIEW_DATE_ISO = '2026-08-10'

export type ResearchArticle = {
  slug: string
  title: string
  description: string
  category: string
  readTime: string
  published: string
  reviewed: string
  intro: string
  sections: Array<{
    heading: string
    paragraphs: string[]
    bullets?: string[]
    formula?: string
  }>
}

export const researchArticles: ResearchArticle[] = [
  {
    slug: 'effective-credit-card-reward-rate',
    title: 'How to calculate the effective reward rate of a credit card',
    description:
      'A practical framework for moving from an advertised reward rate to the value that can realistically be earned after caps, exclusions and annual costs.',
    category: 'Credit cards',
    readTime: '6 min read',
    published: '2026-08-10',
    reviewed: '2026-08-10',
    intro:
      'A headline reward rate is only one input. The useful question is how much value remains after applying the rules that govern where rewards are earned, how much can be earned and what the card costs to hold.',
    sections: [
      {
        heading: '1. Start with eligible spending',
        paragraphs: [
          'Use the spending that actually qualifies for rewards. If a category is excluded, capped or rewarded at a different rate, model it separately instead of applying one rate to the full monthly bill.',
          'This is especially important when a user has large spends in categories that a card may treat differently.',
        ],
        bullets: [
          'Separate regular, accelerated and excluded categories.',
          'Keep EMI, wallet, government, rent or other special categories separate when the issuer has special rules.',
          'Use the issuer’s current definition of an eligible transaction.',
        ],
      },
      {
        heading: '2. Apply caps over the correct period',
        paragraphs: [
          'A monthly cap and an annual cap are not interchangeable. Convert all benefits to the same comparison period before ranking cards.',
        ],
        formula: 'gross reward value = eligible spend × applicable reward rate, subject to the relevant cap',
      },
      {
        heading: '3. Subtract ownership cost',
        paragraphs: [
          'A reward rate can look attractive while the annual fee consumes a large share of the value. Model fee waiver separately because it usually depends on a spending threshold or other condition.',
        ],
        formula: 'net annual value = gross annual reward value − annual fee − applicable taxes',
      },
      {
        heading: '4. Stress-test the result',
        paragraphs: [
          'Change the spending mix, fee-waiver outcome and reward-cap usage. If a card only ranks first under one narrow assumption, the result is less robust than it appears.',
        ],
      },
    ],
  },
  {
    slug: 'fuel-surcharge-waiver-vs-rewards',
    title: 'Fuel surcharge waiver and fuel rewards are not the same benefit',
    description:
      'A framework for separating surcharge mechanics, waiver limits and reward-point value before estimating a fuel card’s real savings.',
    category: 'Fuel cards',
    readTime: '5 min read',
    published: '2026-08-10',
    reviewed: '2026-08-10',
    intro:
      'Fuel-card marketing often places several benefits beside one another. A surcharge waiver, reward points and an app promotion can each have different eligibility rules, so they should be calculated independently before being combined.',
    sections: [
      {
        heading: '1. Model surcharge and waiver separately',
        paragraphs: [
          'A surcharge is a transaction charge. A waiver is a reversal or reimbursement subject to the issuer’s conditions. The waiver may have a transaction range or monthly ceiling.',
        ],
        bullets: [
          'Check the eligible transaction amount range.',
          'Check the maximum waiver per statement cycle or month.',
          'Check whether taxes or other components are excluded from the waiver.',
        ],
      },
      {
        heading: '2. Calculate reward value independently',
        paragraphs: [
          'Reward points should be valued using the redemption path the user realistically intends to use. A nominal point value is not useful if the desired redemption gives a different effective value.',
        ],
        formula: 'reward value = eligible fuel spend × earning rate × realistic point value',
      },
      {
        heading: '3. Do not double-count partner promotions',
        paragraphs: [
          'If a fuel app, voucher or limited-period campaign provides a separate benefit, show it as a promotional layer rather than assuming it is a permanent feature of the card.',
        ],
      },
      {
        heading: '4. Compare the annual result',
        paragraphs: [
          'Once rewards, valid surcharge waiver and recurring costs are modeled separately, combine them over the same period.',
        ],
        formula: 'net fuel value = reward value + valid waiver − annual ownership cost − benefit leakage',
      },
    ],
  },
  {
    slug: 'credit-card-annual-fee-break-even',
    title: 'When does a credit-card annual fee actually pay for itself?',
    description:
      'Use break-even analysis to compare a paid credit card with a lower-fee or no-fee alternative.',
    category: 'Card economics',
    readTime: '5 min read',
    published: '2026-08-10',
    reviewed: '2026-08-10',
    intro:
      'A paid card is not automatically expensive and a no-fee card is not automatically better. The correct comparison is the incremental value the paid card creates relative to the alternative available to the same user.',
    sections: [
      {
        heading: '1. Compare incremental value, not total rewards',
        paragraphs: [
          'If a free alternative would already earn some rewards, only the additional value created by the paid card should be used to recover the paid card’s annual cost.',
        ],
        formula: 'incremental reward rate = paid-card effective rate − alternative effective rate',
      },
      {
        heading: '2. Calculate break-even spending',
        paragraphs: [
          'Break-even spending is the level at which incremental rewards equal the annual ownership cost.',
        ],
        formula: 'break-even spend = annual ownership cost ÷ incremental reward rate',
      },
      {
        heading: '3. Treat fee waiver as a separate scenario',
        paragraphs: [
          'Run one scenario where the fee is paid and another where the waiver threshold is met. This makes it easier to see whether the card is still attractive if spending falls below the waiver threshold.',
        ],
      },
      {
        heading: '4. Value non-cash benefits conservatively',
        paragraphs: [
          'Airport lounge access, memberships, vouchers and milestone benefits should only be given a rupee value when the user would genuinely use them. Retail price is not always personal value.',
        ],
      },
    ],
  },
  {
    slug: 'cashback-cap-math',
    title: 'Why a 5% cashback card may not deliver 5% on your total spending',
    description:
      'Understand category eligibility and reward caps before treating a headline cashback rate as the effective rate.',
    category: 'Cashback',
    readTime: '5 min read',
    published: '2026-08-10',
    reviewed: '2026-08-10',
    intro:
      'A cashback percentage describes the rate applied to qualifying spend. It does not by itself describe the effective return on the user’s entire monthly or annual card spending.',
    sections: [
      {
        heading: '1. Split spending into reward buckets',
        paragraphs: [
          'Create separate buckets for accelerated cashback, base cashback and non-eligible spend. Apply each rate only to the spend that belongs in that bucket.',
        ],
      },
      {
        heading: '2. Convert the cap into a spend ceiling',
        paragraphs: [
          'If the accelerated cashback has a monetary cap, determine how much eligible spending is required to reach that cap. Spending above that level may earn at a lower rate or no additional accelerated cashback.',
        ],
        formula: 'accelerated spend ceiling = cashback cap ÷ accelerated cashback rate',
      },
      {
        heading: '3. Calculate the effective rate',
        paragraphs: [
          'The effective rate uses total card spending in the denominator, not only the transactions that earned the highest cashback rate.',
        ],
        formula: 'effective cashback rate = total cashback earned ÷ total card spend',
      },
      {
        heading: '4. Add annual cost last',
        paragraphs: [
          'After calculating gross cashback, subtract annual ownership cost to compare the card with alternatives on a net basis.',
        ],
      },
    ],
  },
]

export function getResearchArticle(slug: string) {
  return researchArticles.find((article) => article.slug === slug)
}
