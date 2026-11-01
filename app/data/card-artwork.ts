/**
 * Credit-card artwork provenance registry.
 *
 * Candidate URLs are retained for research/audit continuity, but the public UI may
 * only render artwork whose exact product identity AND reuse permission have both
 * been cleared. Public availability, an official host, or a reachable URL is not
 * treated as permission to republish an image.
 */
export type ArtworkSourceKind = 'issuer' | 'partner' | 'third-party'
export type ArtworkRightsStatus = 'cleared' | 'review-required'

export type CardArtworkSource = {
  url: string
  credit: string
  creditUrl: string
  sourceKind: ArtworkSourceKind
  exactProduct: boolean
  rightsStatus: ArtworkRightsStatus
  checkedAt: string
  reviewNote?: string
}

/**
 * Research candidates only. Entries with rightsStatus='review-required' MUST NOT
 * be rendered as public product artwork. Keeping them here prevents provenance
 * work from being lost while still making the publication gate explicit.
 */
export const cardArtworkCandidates: Partial<Record<string, CardArtworkSource>> = {
  'hsbc-live-plus': {
    url: 'https://www.hsbc.co.in/content/dam/hsbc/in/images/16-9/21398-live-plus-visa-infinite-2000X1125.jpg',
    credit: 'HSBC India official card product visual',
    creditUrl: 'https://www.hsbc.co.in/credit-cards/products/live-plus/',
    sourceKind: 'issuer',
    exactProduct: true,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Exact official product visual; reuse/publication permission has not been independently established.',
  },
  'indigo-axis': {
    url: 'https://www.goindigo.in/content/dam/s6web/in/en/assets/partner/axis-credit-card/Axis-CVP-MWeb-Base.jpg',
    credit: 'IndiGo official Axis Bank base-card visual',
    creditUrl: 'https://www.goindigo.in/loyalty/partners/axis-credit-card.html',
    sourceKind: 'partner',
    exactProduct: true,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Exact official partner visual; reuse/publication permission has not been independently established.',
  },
  'indigo-axis-premium': {
    url: 'https://www.goindigo.in/content/dam/s6web/in/en/assets/partner/axis-credit-card/Axis-CVP-MWeb-Premium.jpg',
    credit: 'IndiGo official Axis Bank premium-card visual',
    creditUrl: 'https://www.goindigo.in/loyalty/partners/axis-credit-card.html',
    sourceKind: 'partner',
    exactProduct: true,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Exact official partner visual; reuse/publication permission has not been independently established.',
  },
  'cashback-sbi': {
    url: 'https://www.refpo.com/logos/sbi-cashback-credit-card.webp',
    credit: 'Refpo product artwork',
    creditUrl: 'https://www.refpo.com/credit-cards/sbi-cashback-credit-card',
    sourceKind: 'third-party',
    exactProduct: true,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Third-party host; do not publish without explicit reuse clearance.',
  },
  'flipkart-axis': {
    url: 'https://images.moneycontrol.com/static-hindinews/2025/11/Screenshot-2025-11-20-155807.png',
    credit: 'Moneycontrol card artwork',
    creditUrl: 'https://hindi.moneycontrol.com/',
    sourceKind: 'third-party',
    exactProduct: false,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Screenshot/third-party host; product exactness and reuse permission are not sufficient for publication.',
  },
  'axis-ace': {
    url: 'https://www.cardexpert.in/wp-content/uploads/2020/10/axis-bank-ace-credit-card-1.jpg',
    credit: 'CardExpert product artwork (historical design)',
    creditUrl: 'https://www.cardexpert.in/axis-bank-launches-ace-credit-card/',
    sourceKind: 'third-party',
    exactProduct: false,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Historical third-party design; not suitable as current exact product artwork.',
  },
  'millennia-hdfc': {
    url: 'https://www.rewardmatrix.in/cards/hdfc-millennia.png',
    credit: 'RewardMatrix product artwork',
    creditUrl: 'https://www.rewardmatrix.in/credit-cards/reviews/hdfc-millennia',
    sourceKind: 'third-party',
    exactProduct: true,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Third-party host; do not publish without explicit reuse clearance.',
  },
  'tata-neu-infinity-hdfc': {
    url: 'https://www.rewardmatrix.in/cards/tata-neu-infinity-hdfc.png',
    credit: 'RewardMatrix product artwork',
    creditUrl: 'https://www.rewardmatrix.in/credit-cards/reviews/tata-neu-infinity-hdfc',
    sourceKind: 'third-party',
    exactProduct: true,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Third-party host; do not publish without explicit reuse clearance.',
  },
  'flipkart-sbi': {
    url: 'https://constant.myntassets.com/checkout/assets/img/fksbimastercard.webp',
    credit: 'Myntra/Flipkart/SBI product artwork',
    creditUrl: 'https://www.sbicard.com/en/personal/credit-cards.html',
    sourceKind: 'partner',
    exactProduct: true,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Partner-hosted asset; publication permission and long-term stability need review.',
  },
  'bpcl-sbi-octane': {
    url: 'https://finanjo.com/image/BPCL-SBI-Card-OCTANE.webp',
    credit: 'Finanjo product artwork',
    creditUrl: 'https://finanjo.com/credit-cards/bpcl-sbi-octane-credit-card',
    sourceKind: 'third-party',
    exactProduct: true,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Third-party host; do not publish without explicit reuse clearance.',
  },
  'first-power-plus': {
    url: 'https://www.cashon.cards/IDFC%20POWER%20-.jpg',
    credit: 'CashOnCards product artwork',
    creditUrl: 'https://www.cashon.cards/blogs/post/idfc-first-power-credit-card-review-supercharged-rewards-for-fuel-groceries-smart-everyday-savings',
    sourceKind: 'third-party',
    exactProduct: false,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Third-party host and unclear filename/variant; do not publish as exact product artwork.',
  },
  'indianoil-axis': {
    url: 'https://s3.eu-west-1.amazonaws.com/latest.images.pinkerala.com/news/full/2022/06/axis-bank-and-indian-oil-launch-co-branded-rupay-contactless-credit-card-1.jpg',
    credit: 'IndianOil Axis Bank product artwork',
    creditUrl: 'https://www.axis.bank.in/cards/credit-card/indianoil-axis-bank-credit-card',
    sourceKind: 'third-party',
    exactProduct: false,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Third-party news host; source URL does not establish exact current variant or reuse permission.',
  },
  'sbi-miles-prime': {
    url: 'https://mag-misc.s3.ap-south-1.amazonaws.com/images/hero-sbi-miles-prime-credit-card-review.png',
    credit: 'Magnify card review artwork',
    creditUrl: 'https://magnify.club/guides/sbi-miles-prime-credit-card-review/',
    sourceKind: 'third-party',
    exactProduct: true,
    rightsStatus: 'review-required',
    checkedAt: '2026-11-01',
    reviewNote: 'Third-party review asset; do not publish without explicit reuse clearance.',
  },
}

/** Only source-and-rights-cleared exact artwork is eligible for public rendering. */
export const cardArtworkSources: Partial<Record<string, CardArtworkSource>> = Object.fromEntries(
  Object.entries(cardArtworkCandidates).filter(([, art]) => art?.exactProduct && art.rightsStatus === 'cleared'),
) as Partial<Record<string, CardArtworkSource>>

export function getCardArtwork(cardId: string): CardArtworkSource | undefined {
  return Object.prototype.hasOwnProperty.call(cardArtworkSources, cardId) ? cardArtworkSources[cardId] : undefined
}

export function getCardArtworkCandidate(cardId: string): CardArtworkSource | undefined {
  return Object.prototype.hasOwnProperty.call(cardArtworkCandidates, cardId) ? cardArtworkCandidates[cardId] : undefined
}
