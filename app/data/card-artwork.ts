/**
 * Editorial product artwork references. These images are NOT financial-term sources.
 * Map by exact normalized card id only; never infer a product image from issuer name.
 * Remote product artwork is controlled by third parties. If missing, blocked, changed,
 * or insufficiently attributable, CardArtwork renders a labelled neutral illustration.
 *
 * Only isolated, product-specific artwork belongs in the public gallery.
 * Editorial banners, multi-product collages and unclear variants are excluded.
 * Image review: 2026-11-01. Recheck provider rights and URLs periodically.
 */
export type CardArtworkSource = { url: string; credit: string; creditUrl: string; variant?: 'family' }
export const cardArtworkSources: Partial<Record<string, CardArtworkSource>> = {
  'hsbc-live-plus': {
    url: 'https://www.hsbc.co.in/content/dam/hsbc/in/images/16-9/21398-live-plus-visa-infinite-2000X1125.jpg',
    credit: 'HSBC India official card product visual',
    creditUrl: 'https://www.hsbc.co.in/credit-cards/products/live-plus/',
  },
  'indigo-axis': {
    url: 'https://www.goindigo.in/content/dam/s6web/in/en/assets/partner/axis-credit-card/Axis-CVP-MWeb-Base.jpg',
    credit: 'IndiGo official Axis Bank base-card visual',
    creditUrl: 'https://www.goindigo.in/loyalty/partners/axis-credit-card.html',
  },
  'indigo-axis-premium': {
    url: 'https://www.goindigo.in/content/dam/s6web/in/en/assets/partner/axis-credit-card/Axis-CVP-MWeb-Premium.jpg',
    credit: 'IndiGo official Axis Bank premium-card visual',
    creditUrl: 'https://www.goindigo.in/loyalty/partners/axis-credit-card.html',
  },
  'cashback-sbi': {
    url: 'https://www.refpo.com/logos/sbi-cashback-credit-card.webp',
    credit: 'Refpo product artwork',
    creditUrl: 'https://www.refpo.com/credit-cards/sbi-cashback-credit-card',
  },
  'flipkart-axis': {
    url: 'https://images.moneycontrol.com/static-hindinews/2025/11/Screenshot-2025-11-20-155807.png',
    credit: 'Moneycontrol card artwork',
    creditUrl: 'https://hindi.moneycontrol.com/',
  },
  'axis-ace': {
    url: 'https://www.cardexpert.in/wp-content/uploads/2020/10/axis-bank-ace-credit-card-1.jpg',
    credit: 'CardExpert product artwork (historical design)',
    creditUrl: 'https://www.cardexpert.in/axis-bank-launches-ace-credit-card/',
  },
  'millennia-hdfc': {
    url: 'https://www.rewardmatrix.in/cards/hdfc-millennia.png',
    credit: 'RewardMatrix product artwork',
    creditUrl: 'https://www.rewardmatrix.in/credit-cards/reviews/hdfc-millennia',
  },
  'tata-neu-infinity-hdfc': {
    url: 'https://www.rewardmatrix.in/cards/tata-neu-infinity-hdfc.png',
    credit: 'RewardMatrix product artwork',
    creditUrl: 'https://www.rewardmatrix.in/credit-cards/reviews/tata-neu-infinity-hdfc',
  },
  'flipkart-sbi': {
    url: 'https://constant.myntassets.com/checkout/assets/img/fksbimastercard.webp',
    credit: 'Myntra/Flipkart/SBI product artwork',
    creditUrl: 'https://www.sbicard.com/en/personal/credit-cards.html',
  },
  'bpcl-sbi-octane': {
    url: 'https://finanjo.com/image/BPCL-SBI-Card-OCTANE.webp',
    credit: 'Finanjo product artwork',
    creditUrl: 'https://finanjo.com/credit-cards/bpcl-sbi-octane-credit-card',
  },
  'first-power-plus': {
    url: 'https://www.cashon.cards/IDFC%20POWER%20-.jpg',
    credit: 'CashOnCards product artwork',
    creditUrl: 'https://www.cashon.cards/blogs/post/idfc-first-power-credit-card-review-supercharged-rewards-for-fuel-groceries-smart-everyday-savings',
  },
  'indianoil-axis': {
    url: 'https://s3.eu-west-1.amazonaws.com/latest.images.pinkerala.com/news/full/2022/06/axis-bank-and-indian-oil-launch-co-branded-rupay-contactless-credit-card-1.jpg',
    credit: 'IndianOil Axis Bank product artwork',
    creditUrl: 'https://www.axis.bank.in/cards/credit-card/indianoil-axis-bank-credit-card',
  },
  'sbi-miles-prime': {
    url: 'https://mag-misc.s3.ap-south-1.amazonaws.com/images/hero-sbi-miles-prime-credit-card-review.png',
    credit: 'Magnify card review artwork',
    creditUrl: 'https://magnify.club/guides/sbi-miles-prime-credit-card-review/',
  },
}
export function getCardArtwork(cardId: string): CardArtworkSource | undefined {
  return Object.prototype.hasOwnProperty.call(cardArtworkSources, cardId) ? cardArtworkSources[cardId] : undefined
}
