export type CardCategorySlug =
  | 'cashback'
  | 'fuel'
  | 'travel'
  | 'shopping'
  | 'grocery'
  | 'dining'
  | 'utilities'
  | 'upi'
  | 'forex'
  | 'lounge'
  | 'premium'
  | 'business'
  | 'lifetime-free'
  | 'beginner'
  | 'low-fee'
  | 'co-branded'

export type FieldDefinition = {
  key: string
  label: string
  hint?: string
  prefix?: string
  suffix?: string
  step?: number
  defaultValue: number
}

export type CardCategoryDefinition = {
  slug: CardCategorySlug
  title: string
  shortTitle: string
  eyebrow: string
  description: string
  question: string
  netLabel: string
  scenarioFields: FieldDefinition[]
  cardFields: FieldDefinition[]
  methodology: string[]
  seoTitle: string
  seoDescription: string
}

const feeFields: FieldDefinition[] = [
  { key: 'annualFee', label: 'Annual fee', prefix: '₹', defaultValue: 999 },
  { key: 'feeTax', label: 'Fee GST', suffix: '%', step: 0.1, defaultValue: 18 },
  { key: 'waiverSpend', label: 'Fee-waiver spend / year', prefix: '₹', defaultValue: 200000 },
]

const standardScenario = (label: string, key = 'monthlySpend'): FieldDefinition[] => [
  { key, label, prefix: '₹', defaultValue: 20000 },
]

const standardRewardFields = (label = 'Reward / cashback rate'): FieldDefinition[] => [
  { key: 'rewardRate', label, suffix: '%', step: 0.1, defaultValue: 2 },
  { key: 'monthlyCap', label: 'Monthly reward cap', prefix: '₹', defaultValue: 1000 },
  ...feeFields,
]

export const cardCategories: CardCategoryDefinition[] = [
  {
    slug: 'cashback',
    title: 'Cashback Credit Cards',
    shortTitle: 'Cashback',
    eyebrow: 'Cashback economics',
    description: 'Compare effective cashback after reward caps, fee, GST and fee-waiver conditions.',
    question: 'Which cashback structure creates the highest net annual value for this spending?',
    netLabel: 'Net annual cashback',
    scenarioFields: standardScenario('Eligible monthly card spend'),
    cardFields: standardRewardFields('Cashback rate'),
    methodology: [
      'Apply cashback only to the eligible spending entered.',
      'Cap accelerated cashback at the monthly limit before annualising.',
      'Subtract annual fee and fee GST unless the modeled annual spend clears the waiver threshold.',
    ],
    seoTitle: 'Cashback Credit Card Comparison Calculator',
    seoDescription: 'Compare cashback credit-card economics using spending, cashback rates, caps, annual fees and waiver thresholds.',
  },
  {
    slug: 'fuel',
    title: 'Fuel Credit Cards',
    shortTitle: 'Fuel',
    eyebrow: 'Fuel economics',
    description: 'Compare fuel rewards and surcharge-waiver value without double-counting the same transaction benefit.',
    question: 'Which fuel card structure creates the highest modeled annual fuel saving?',
    netLabel: 'Net annual fuel value',
    scenarioFields: standardScenario('Monthly fuel spend', 'monthlyFuelSpend'),
    cardFields: [
      { key: 'rewardRate', label: 'Fuel reward value', suffix: '%', step: 0.1, defaultValue: 4 },
      { key: 'rewardCap', label: 'Monthly fuel reward cap', prefix: '₹', defaultValue: 1000 },
      { key: 'waiverRate', label: 'Surcharge-waiver rate', suffix: '%', step: 0.1, defaultValue: 1 },
      { key: 'waiverCap', label: 'Monthly waiver cap', prefix: '₹', defaultValue: 250 },
      ...feeFields,
    ],
    methodology: [
      'Calculate fuel rewards and surcharge waiver as separate benefit components.',
      'Apply the reward cap and surcharge-waiver cap independently.',
      'Subtract annual ownership cost after checking the fee-waiver scenario.',
    ],
    seoTitle: 'Fuel Credit Card Comparison Calculator',
    seoDescription: 'Compare fuel rewards, surcharge waiver, monthly caps and annual fees using your fuel spending.',
  },
  {
    slug: 'travel',
    title: 'Travel Credit Cards',
    shortTitle: 'Travel',
    eyebrow: 'Travel value',
    description: 'Model travel rewards, lounge usage and foreign-exchange cost in the same annual comparison.',
    question: 'Which travel card structure creates the best modeled value for your travel pattern?',
    netLabel: 'Net annual travel value',
    scenarioFields: [
      { key: 'monthlyTravelSpend', label: 'Monthly travel spend', prefix: '₹', defaultValue: 20000 },
      { key: 'annualForeignSpend', label: 'Annual foreign spend', prefix: '₹', defaultValue: 100000 },
      { key: 'loungeVisits', label: 'Lounge visits / year', defaultValue: 6 },
      { key: 'loungeValue', label: 'Your value / lounge visit', prefix: '₹', defaultValue: 700 },
    ],
    cardFields: [
      { key: 'travelRewardRate', label: 'Travel reward value', suffix: '%', step: 0.1, defaultValue: 3 },
      { key: 'foreignRewardRate', label: 'Foreign-spend reward value', suffix: '%', step: 0.1, defaultValue: 2 },
      { key: 'forexMarkup', label: 'Forex markup', suffix: '%', step: 0.1, defaultValue: 2 },
      { key: 'freeLoungeVisits', label: 'Complimentary lounge visits / year', defaultValue: 4 },
      ...feeFields,
    ],
    methodology: [
      'Value travel and foreign-spend rewards separately.',
      'Treat forex markup as a cost against international-spend value.',
      'Value only the lounge visits the user expects to use, not an unlimited headline entitlement.',
    ],
    seoTitle: 'Travel Credit Card Comparison Calculator',
    seoDescription: 'Compare travel rewards, lounge value, forex markup, annual fees and waiver conditions.',
  },
  {
    slug: 'shopping',
    title: 'Online Shopping Credit Cards',
    shortTitle: 'Shopping',
    eyebrow: 'Shopping rewards',
    description: 'Compare reward economics for online shopping after category caps and annual card costs.',
    question: 'Which shopping-card structure best fits your online spending?',
    netLabel: 'Net annual shopping value',
    scenarioFields: standardScenario('Monthly online-shopping spend'),
    cardFields: standardRewardFields('Online-shopping reward rate'),
    methodology: [
      'Model only the shopping spend that receives the entered accelerated rate.',
      'Apply the monthly category cap before annualising rewards.',
      'Compare the net result after fee and fee-waiver treatment.',
    ],
    seoTitle: 'Online Shopping Credit Card Comparison Calculator',
    seoDescription: 'Compare online-shopping credit-card reward rates, caps, fees and net annual value.',
  },
  {
    slug: 'grocery',
    title: 'Grocery Credit Cards',
    shortTitle: 'Grocery',
    eyebrow: 'Grocery rewards',
    description: 'Compare cards around recurring grocery expenditure and category reward limits.',
    question: 'Which card structure returns the most value on your grocery budget?',
    netLabel: 'Net annual grocery value',
    scenarioFields: standardScenario('Monthly grocery spend'),
    cardFields: standardRewardFields('Grocery reward rate'),
    methodology: [
      'Use monthly grocery expenditure as the eligible reward base.',
      'Apply any modeled monthly reward ceiling before calculating annual benefit.',
      'Subtract annual ownership cost unless the modeled waiver threshold is cleared.',
    ],
    seoTitle: 'Grocery Credit Card Comparison Calculator',
    seoDescription: 'Compare grocery credit-card rewards, category caps, annual fees and fee waivers.',
  },
  {
    slug: 'dining',
    title: 'Dining Credit Cards',
    shortTitle: 'Dining',
    eyebrow: 'Dining rewards',
    description: 'Compare dining reward structures based on the amount you actually spend at restaurants.',
    question: 'Which card structure creates the highest modeled dining value?',
    netLabel: 'Net annual dining value',
    scenarioFields: standardScenario('Monthly dining spend'),
    cardFields: standardRewardFields('Dining reward rate'),
    methodology: [
      'Use actual dining spend instead of a headline reward rate alone.',
      'Apply category caps and annual card cost consistently.',
      'Do not assign value to restaurant offers that are not modeled in the inputs.',
    ],
    seoTitle: 'Dining Credit Card Comparison Calculator',
    seoDescription: 'Compare dining reward rates, monthly caps, annual fees and net annual card value.',
  },
  {
    slug: 'utilities',
    title: 'Utility Bill Credit Cards',
    shortTitle: 'Utilities',
    eyebrow: 'Utility rewards',
    description: 'Compare credit-card economics for electricity, mobile, broadband and other eligible utility spending.',
    question: 'Which card structure creates the best modeled utility-bill return?',
    netLabel: 'Net annual utility value',
    scenarioFields: standardScenario('Monthly eligible utility spend'),
    cardFields: standardRewardFields('Utility reward rate'),
    methodology: [
      'Use only utility transactions that are eligible under the modeled product rules.',
      'Apply category caps before annualising the benefit.',
      'Compare rewards with the full annual ownership cost.',
    ],
    seoTitle: 'Utility Bill Credit Card Comparison Calculator',
    seoDescription: 'Compare utility-bill credit-card rewards, caps, annual fees and effective return.',
  },
  {
    slug: 'upi',
    title: 'RuPay / UPI Credit Cards',
    shortTitle: 'UPI / RuPay',
    eyebrow: 'UPI economics',
    description: 'Model the value of eligible credit-card-on-UPI merchant spending after caps and card costs.',
    question: 'Which UPI credit-card structure best fits your eligible merchant spending?',
    netLabel: 'Net annual UPI value',
    scenarioFields: standardScenario('Monthly eligible UPI merchant spend'),
    cardFields: standardRewardFields('UPI reward rate'),
    methodology: [
      'Use eligible merchant UPI spend, not all person-to-person UPI transactions.',
      'Apply the modeled UPI reward ceiling before annualising.',
      'Subtract annual card ownership cost after waiver treatment.',
    ],
    seoTitle: 'RuPay UPI Credit Card Comparison Calculator',
    seoDescription: 'Compare RuPay UPI credit-card rewards, caps, fees and effective annual value.',
  },
  {
    slug: 'forex',
    title: 'Forex / International Credit Cards',
    shortTitle: 'Forex',
    eyebrow: 'International-spend cost',
    description: 'Compare forex markup against the rewards earned on foreign transactions.',
    question: 'Which card structure leaves the lowest modeled net international cost?',
    netLabel: 'Net annual international value',
    scenarioFields: [
      { key: 'annualForeignSpend', label: 'Annual foreign-currency spend', prefix: '₹', defaultValue: 200000 },
    ],
    cardFields: [
      { key: 'foreignRewardRate', label: 'Foreign-spend reward value', suffix: '%', step: 0.1, defaultValue: 2 },
      { key: 'forexMarkup', label: 'Forex markup', suffix: '%', step: 0.1, defaultValue: 2 },
      ...feeFields,
    ],
    methodology: [
      'Treat forex markup as a direct cost on annual international spend.',
      'Offset that cost only with reward value realistically earned on foreign spend.',
      'Include annual card ownership cost in the final comparison.',
    ],
    seoTitle: 'Forex Credit Card Comparison Calculator',
    seoDescription: 'Compare forex markup, foreign-spend rewards, annual fees and net international card cost.',
  },
  {
    slug: 'lounge',
    title: 'Airport Lounge Credit Cards',
    shortTitle: 'Lounge',
    eyebrow: 'Lounge value',
    description: 'Value only the complimentary visits you expect to use, then compare that benefit with annual card cost.',
    question: 'Which lounge-card structure creates the most usable value for your travel frequency?',
    netLabel: 'Net annual lounge value',
    scenarioFields: [
      { key: 'loungeVisits', label: 'Lounge visits you expect / year', defaultValue: 8 },
      { key: 'loungeValue', label: 'Your realistic value / visit', prefix: '₹', defaultValue: 700 },
      { key: 'annualCardSpend', label: 'Annual card spend', prefix: '₹', defaultValue: 200000 },
    ],
    cardFields: [
      { key: 'freeLoungeVisits', label: 'Complimentary visits / year', defaultValue: 4 },
      ...feeFields,
    ],
    methodology: [
      'Value only the visits you expect to use.',
      'Cap benefit at the number of complimentary visits entered for the card.',
      'Subtract annual card cost instead of valuing lounge access in isolation.',
    ],
    seoTitle: 'Airport Lounge Credit Card Comparison Calculator',
    seoDescription: 'Compare airport lounge credit-card value based on expected visits, realistic visit value and annual fees.',
  },
  {
    slug: 'premium',
    title: 'Premium Credit Cards',
    shortTitle: 'Premium',
    eyebrow: 'Premium-card economics',
    description: 'Combine recurring rewards with realistic milestone and lifestyle value before subtracting premium card costs.',
    question: 'Which premium-card structure creates the highest modeled annual value?',
    netLabel: 'Net annual premium value',
    scenarioFields: standardScenario('Monthly eligible card spend'),
    cardFields: [
      { key: 'rewardRate', label: 'Reward value', suffix: '%', step: 0.1, defaultValue: 2.5 },
      { key: 'milestoneValue', label: 'Annual milestone value you will use', prefix: '₹', defaultValue: 3000 },
      { key: 'lifestyleValue', label: 'Other annual benefits you will use', prefix: '₹', defaultValue: 2000 },
      ...feeFields,
    ],
    methodology: [
      'Start with recurring reward value on eligible annual spend.',
      'Add only milestone and lifestyle benefits the user expects to use.',
      'Subtract annual ownership cost unless the fee waiver is achieved.',
    ],
    seoTitle: 'Premium Credit Card Comparison Calculator',
    seoDescription: 'Compare premium credit-card rewards, milestone value, lifestyle benefits and annual fees.',
  },
  {
    slug: 'business',
    title: 'Business Credit Cards',
    shortTitle: 'Business',
    eyebrow: 'Business-spend economics',
    description: 'Compare modeled reward value on eligible recurring business spending and annual ownership cost.',
    question: 'Which card structure creates the highest modeled value for your business spending?',
    netLabel: 'Net annual business value',
    scenarioFields: standardScenario('Monthly eligible business spend'),
    cardFields: standardRewardFields('Business-spend reward rate'),
    methodology: [
      'Use eligible business spending rather than total company turnover.',
      'Apply reward caps to the modeled category.',
      'Subtract annual ownership cost and treat fee waiver as a separate condition.',
    ],
    seoTitle: 'Business Credit Card Comparison Calculator',
    seoDescription: 'Compare business credit-card reward rates, caps, annual fees and modeled annual value.',
  },
  {
    slug: 'lifetime-free',
    title: 'Lifetime-Free Credit Cards',
    shortTitle: 'Lifetime Free',
    eyebrow: 'No-fee economics',
    description: 'Compare cards where the modeled annual ownership fee is zero, focusing on reward rate and cap leakage.',
    question: 'Which lifetime-free card structure creates the highest modeled recurring value?',
    netLabel: 'Net annual reward value',
    scenarioFields: standardScenario('Monthly eligible spend'),
    cardFields: [
      { key: 'rewardRate', label: 'Reward value', suffix: '%', step: 0.1, defaultValue: 1 },
      { key: 'monthlyCap', label: 'Monthly reward cap', prefix: '₹', defaultValue: 0 },
    ],
    methodology: [
      'Assume zero annual card ownership fee.',
      'Apply any modeled monthly reward cap before annualising.',
      'Rank primarily by recurring reward value and cap efficiency.',
    ],
    seoTitle: 'Lifetime Free Credit Card Comparison Calculator',
    seoDescription: 'Compare lifetime-free credit-card reward rates, reward caps and effective annual value.',
  },
  {
    slug: 'beginner',
    title: 'Beginner Credit Cards',
    shortTitle: 'Beginner',
    eyebrow: 'Simple-card economics',
    description: 'Compare straightforward card economics with extra weight on low ownership cost and resilient base rewards.',
    question: 'Which simple card structure gives the strongest modeled value with lower ownership friction?',
    netLabel: 'Net annual beginner-card value',
    scenarioFields: standardScenario('Monthly eligible spend'),
    cardFields: standardRewardFields('Reward value'),
    methodology: [
      'Compare recurring value using the spending level entered.',
      'Give ownership cost a visible role in the score.',
      'Do not treat approval probability or credit history as part of this reward-value model.',
    ],
    seoTitle: 'Beginner Credit Card Comparison Calculator',
    seoDescription: 'Compare beginner credit-card rewards, fees, caps and annual value using a transparent model.',
  },
  {
    slug: 'low-fee',
    title: 'Low Annual Fee Credit Cards',
    shortTitle: 'Low Fee',
    eyebrow: 'Fee efficiency',
    description: 'Compare whether a modest annual fee is justified by the reward value generated by your spending.',
    question: 'Which low-fee card structure converts ownership cost into the most net value?',
    netLabel: 'Net annual value',
    scenarioFields: standardScenario('Monthly eligible spend'),
    cardFields: standardRewardFields('Reward value'),
    methodology: [
      'Compare net annual value, not annual fee alone.',
      'Apply reward caps before subtracting ownership cost.',
      'Show fee-waiver impact as a distinct modeled outcome.',
    ],
    seoTitle: 'Low Annual Fee Credit Card Comparison Calculator',
    seoDescription: 'Compare low-fee credit cards using rewards, caps, annual fees and fee-waiver thresholds.',
  },
  {
    slug: 'co-branded',
    title: 'Co-Branded Credit Cards',
    shortTitle: 'Co-Branded',
    eyebrow: 'Partner-spend economics',
    description: 'Compare accelerated partner rewards with base rewards earned outside the partner ecosystem.',
    question: 'Which co-branded structure best matches how much you actually spend with the partner?',
    netLabel: 'Net annual co-branded value',
    scenarioFields: [
      { key: 'monthlyPartnerSpend', label: 'Monthly partner spend', prefix: '₹', defaultValue: 15000 },
      { key: 'monthlyOtherSpend', label: 'Monthly other spend', prefix: '₹', defaultValue: 20000 },
    ],
    cardFields: [
      { key: 'partnerRate', label: 'Partner reward value', suffix: '%', step: 0.1, defaultValue: 5 },
      { key: 'baseRate', label: 'Other-spend reward value', suffix: '%', step: 0.1, defaultValue: 1 },
      { key: 'monthlyCap', label: 'Monthly partner reward cap', prefix: '₹', defaultValue: 1000 },
      ...feeFields,
    ],
    methodology: [
      'Separate partner spending from all other card spending.',
      'Apply the partner reward cap before adding base rewards.',
      'Subtract annual ownership cost after fee-waiver treatment.',
    ],
    seoTitle: 'Co-Branded Credit Card Comparison Calculator',
    seoDescription: 'Compare co-branded credit cards using partner spend, base rewards, reward caps and annual fees.',
  },
]

export const cardCategoryMap = Object.fromEntries(
  cardCategories.map((category) => [category.slug, category]),
) as Record<CardCategorySlug, CardCategoryDefinition>

export const cardCategorySlugs = cardCategories.map((category) => category.slug)

export function isCardCategorySlug(value: string): value is CardCategorySlug {
  return cardCategorySlugs.includes(value as CardCategorySlug)
}
