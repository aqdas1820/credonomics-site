import type { CardCategorySlug } from './card-categories'
import { additionalVerifiedCards } from './verified-card-expansion'
import { secondWaveCards } from './verified-card-expansion-wave2'

export type RealCardTerms = {
  ratePercent?: number
  baseRatePercent?: number
  monthlyCapRupees?: number
  annualCapRupees?: number
  secondaryRatePercent?: number
  secondaryMonthlyCapRupees?: number
  loungeVisits?: number
  forexMarkupPercent?: number
  fixedAnnualValueRupees?: number
  network?: string
  pointValueRupees?: number
  monthlyTiers?: Array<{ upto?: number; ratePercent: number }>
  rankingEligible?: boolean
  baseCashbackCapMultiplier?: number
  note: string
}

export type VerifiedRealCard = {
  /** Source-backed listing only; complete reward-value normalization pending. */
  catalogueOnly?: boolean
  /** Standard annual renewal fee nuances, including joining and conditional LTF offers. */
  feeNote?: string
  id: string
  issuer: string
  name: string
  annualFeeRupees: number
  feeTaxPercent: number
  feeWaiverAnnualSpendRupees?: number
  verifiedAt: string
  sourceUrl: string
  sourceLabel: string
  holderNotice?: { label: string; detail: string; checkedAt: string; href: string }
  terms: Partial<Record<CardCategorySlug, RealCardTerms>>
}

const verifiedAt = '2026-08-10'

export const verifiedRealCards: VerifiedRealCard[] = [
  {
    id: 'cashback-sbi',
    issuer: 'SBI Card',
    name: 'CASHBACK SBI Card',
    annualFeeRupees: 999,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 200000,
    verifiedAt,
    sourceUrl: 'https://www.sbicard.com/en/personal/credit-cards/cashback-sbi-card.html',
    sourceLabel: 'Official SBI Card product page',
    terms: {
      cashback: { ratePercent: 5, monthlyCapRupees: 2000, note: '5% on eligible online spends; 1% on eligible offline spends. Online cashback cap ₹2,000/statement cycle.' },
      shopping: { ratePercent: 5, monthlyCapRupees: 2000, note: 'Modeled on eligible online shopping spend under the 5% online cashback benefit.' },
      'low-fee': { ratePercent: 5, monthlyCapRupees: 2000, note: 'Low-fee comparison uses the card’s eligible online-spend cashback.' },
      fuel: { ratePercent: 0, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 100, network: 'Any', note: 'No cashback on fuel; 1% fuel-surcharge waiver, subject to transaction conditions and ₹100 statement-cycle cap.' },
    },
  },
  {
    id: 'axis-cashback',
    issuer: 'Axis Bank',
    name: 'Axis Bank Cashback Credit Card',
    annualFeeRupees: 1000,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 400000,
    verifiedAt,
    sourceUrl: 'https://www.axis.bank.in/cards/credit-card/cashback-credit-card',
    sourceLabel: 'Official Axis Bank product page',
    terms: {
      cashback: {
        monthlyTiers: [
          { upto: 5000, ratePercent: 2 },
          { upto: 40000, ratePercent: 5 },
          { ratePercent: 7 },
        ],
        monthlyCapRupees: 4000,
        note: 'Monthly online cashback is tiered: 2% up to ₹5k, 5% on ₹5k–₹40k, 7% above ₹40k; total online cashback up to ₹4,000/statement month.',
      },
      shopping: {
        monthlyTiers: [
          { upto: 5000, ratePercent: 2 },
          { upto: 40000, ratePercent: 5 },
          { ratePercent: 7 },
        ],
        monthlyCapRupees: 4000,
        note: 'Uses the official online-spend tier structure for shopping comparison.',
      },
      utilities: { ratePercent: 0.5, monthlyCapRupees: 100, note: '0.5% cashback on utilities, capped at ₹100.' },
    },
  },
  {
    id: 'amazon-pay-icici',
    issuer: 'ICICI Bank',
    name: 'Amazon Pay ICICI Bank Credit Card',
    annualFeeRupees: 0,
    feeTaxPercent: 18,
    verifiedAt,
    sourceUrl: 'https://www.icicibank.com/personal-banking/cards/credit-card/amazon-pay-credit-card/amazon-pay-faq',
    sourceLabel: 'Official ICICI Bank Amazon Pay card FAQ',
    terms: {
      cashback: { ratePercent: 5, note: 'Modeled for Amazon Prime purchases on Amazon India; non-Prime and other spends earn lower rates.' },
      shopping: { ratePercent: 5, note: '5% back for Prime members on eligible Amazon India purchases; no annual fee and no reward earning limit stated for eligible rewards.' },
      'lifetime-free': { ratePercent: 1, note: 'No joining or annual fee; base 1% back on eligible other payments.' },
      'low-fee': { ratePercent: 5, note: 'No annual fee; modeled on eligible Amazon Prime purchases.' },
      'co-branded': { ratePercent: 5, baseRatePercent: 1, note: 'Amazon co-brand: 5% Prime Amazon rate and 1% base on eligible other payments.' },
    },
  },
  {
    id: 'flipkart-axis',
    issuer: 'Axis Bank',
    name: 'Flipkart Axis Bank Credit Card',
    annualFeeRupees: 500,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 350000,
    verifiedAt,
    sourceUrl: 'https://www.axis.bank.in/cards/credit-card/flipkart-axisbank-credit-card',
    sourceLabel: 'Official Axis Bank product page',
    terms: {
      cashback: { ratePercent: 5, annualCapRupees: 16000, note: 'Modeled on eligible Flipkart cashback; official card also offers 7.5% on Myntra and 4% at preferred merchants.' },
      shopping: { ratePercent: 5, annualCapRupees: 16000, note: '5% cashback on eligible Flipkart spend, quarterly cap ₹4,000 for Flipkart. Myntra has a separate 7.5% benefit.' },
      'co-branded': { ratePercent: 5, baseRatePercent: 1, annualCapRupees: 16000, note: 'Flipkart co-brand comparison uses 5% Flipkart cashback and 1% eligible base cashback.' },
      fuel: { ratePercent: 0, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 400, network: 'Any', note: '1% fuel-surcharge waiver subject to transaction conditions; no cashback on fuel.' },
      'low-fee': { ratePercent: 5, annualCapRupees: 16000, note: '₹500 annual fee with fee waiver threshold; shopping comparison uses Flipkart cashback.' },
    },
  },
  {
    id: 'airtel-axis',
    issuer: 'Axis Bank',
    name: 'Airtel Axis Bank Credit Card',
    annualFeeRupees: 500,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 200000,
    verifiedAt,
    sourceUrl: 'https://www.axis.bank.in/cards/credit-card/airtel-axis-bank-credit-card',
    sourceLabel: 'Official Axis Bank product page',
    terms: {
      cashback: { ratePercent: 1, note: 'Base cashback on eligible other spends; accelerated partner benefits are modeled in their relevant categories.' },
      utilities: { ratePercent: 10, baseCashbackCapMultiplier: 1, note: '10% on eligible utility bill payments via Airtel Thanks; statement-cycle cap equals the 1% base cashback earned in that cycle; zero base cashback means no utility cashback.' },
      dining: { ratePercent: 10, monthlyCapRupees: 200, note: '10% partner-wallet value back at Zomato, capped at ₹200/month; ₹499 minimum order and coupon required. This is not statement cashback.' },
      'co-branded': { ratePercent: 25, baseRatePercent: 1, baseCashbackCapMultiplier: 2, note: '25% on eligible Airtel mobile/broadband/Wi-Fi/DTH via Airtel Thanks; cap is twice the 1% base cashback earned in the same statement cycle.' },
      fuel: { ratePercent: 0, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 500, network: 'Any', note: '1% fuel-surcharge waiver subject to transaction conditions; no cashback on fuel.' },
      'low-fee': { ratePercent: 1, note: '₹500 annual fee; base cashback modeled conservatively.' },
    },
  },
  {
    id: 'axis-ace',
    issuer: 'Axis Bank',
    name: 'Axis Bank ACE Credit Card',
    annualFeeRupees: 499,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 200000,
    verifiedAt,
    sourceUrl: 'https://www.axis.bank.in/cards/credit-card/axis-bank-ace-credit-card',
    sourceLabel: 'Official Axis Bank product page',
    terms: {
      cashback: { ratePercent: 1.5, note: '1.5% cashback on eligible other spends; accelerated categories are modeled separately.' },
      utilities: { ratePercent: 5, monthlyCapRupees: 500, note: '5% cashback on eligible utility/DTH/mobile recharge via Google Pay; ₹500 combined cap across 5% and 4% categories per statement; Android Google Pay only.' },
      dining: { ratePercent: 4, monthlyCapRupees: 500, note: '4% cashback on eligible Swiggy/Zomato spends; ₹500 combined cap across the 4% and 5% categories per statement.' },
      fuel: { ratePercent: 0, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 500, network: 'Any', note: '1% fuel-surcharge waiver on eligible transactions; no cashback on fuel.' },
      'low-fee': { ratePercent: 1.5, note: '₹499 annual fee and 1.5% eligible base cashback.' },
    },
  },
  {
    id: 'hsbc-live-plus',
    issuer: 'HSBC India',
    name: 'HSBC Live+ Credit Card',
    annualFeeRupees: 999,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 200000,
    verifiedAt,
    sourceUrl: 'https://www.hsbc.bank.in/credit-cards/products/live-plus/',
    sourceLabel: 'Official HSBC India product page',
    holderNotice: { label: 'Dated Myntra promotion', detail: 'Checked 27 October: eligible Myntra purchases earn 10% through 31 October 2026 inclusive, sharing the ₹1,200 billing-cycle accelerated cap. Standard 1.5% applies after the offer; read completion and exclusion rules.', checkedAt: '2026-10-27', href: '/research/watch/hsbc-live-plus-myntra-offer-october-2026' },
    terms: {
      cashback: { ratePercent: 1.5, note: '1.5% unlimited cashback on most other eligible spends.' },
      grocery: { ratePercent: 10, monthlyCapRupees: 1200, note: '10% accelerated cashback shared across dining, food delivery, grocery, eligible shopping and utilities, capped at ₹1,200/month.' },
      dining: { ratePercent: 10, monthlyCapRupees: 1200, note: '10% accelerated cashback shared across dining, food delivery, grocery, eligible shopping and utilities, capped at ₹1,200/month.' },
      utilities: { ratePercent: 10, monthlyCapRupees: 1200, note: '10% on eligible utility MCCs under the shared ₹1,200 monthly accelerated cap.' },
      shopping: { ratePercent: 10, monthlyCapRupees: 1200, note: '10% on eligible shopping MCCs under the shared ₹1,200 cap. Amazon and Flipkart earn 1.5%. Myntra normally earns 1.5%; the dated 31 July–31 October 2026 promotion gives eligible purchases 10% under the shared ₹1,200 billing-cycle cap. Permanent annual estimates exclude this temporary promotion.' },
      'low-fee': { ratePercent: 1.5, note: '₹999 annual fee, waived above ₹2 lakh annual spend; 1.5% on most other eligible spend.' },
    },
  },
  {
    id: 'freecharge-plus-axis',
    issuer: 'Axis Bank',
    name: 'Axis Bank Freecharge Plus Credit Card',
    annualFeeRupees: 350,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 50000,
    verifiedAt,
    sourceUrl: 'https://www.axis.bank.in/cards/credit-card/axis-bank-freecharge-plus-credit-card',
    sourceLabel: 'Official Axis Bank product page',
    terms: {
      cashback: { ratePercent: 1, note: '1% cashback on eligible other spends; 5% Freecharge and 2% local commute are accelerated categories.' },
      shopping: { ratePercent: 5, note: 'Modeled on eligible Freecharge spend.' },
      'co-branded': { ratePercent: 5, baseRatePercent: 1, note: 'Freecharge co-brand: 5% on Freecharge spend, 2% local commute and 1% eligible other spend.' },
      'low-fee': { ratePercent: 1, note: 'First-year annual fee is nil; recurring annual fee is ₹350 and can be waived at the issuer threshold.' },
    },
  },
  {
    id: 'swiggy-hdfc',
    holderNotice: { label: 'Legacy card · phased migration', detail: 'Existing-holder estimate only while legacy terms apply. Not a recommendation for a new application; Ornge and BLCK have different terms.', checkedAt: '2026-10-25', href: '/research/watch/swiggy-hdfc-migration-autopay-checklist' },
    issuer: 'HDFC Bank',
    name: 'Swiggy HDFC Bank Credit Card',
    annualFeeRupees: 500,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 200000,
    verifiedAt,
    sourceUrl: 'https://www.hdfc.bank.in/credit-cards/swiggy-hdfc-bank-credit-card',
    sourceLabel: 'Official HDFC Bank product page',
    terms: {
      cashback: { ratePercent: 5, monthlyCapRupees: 1500, note: '5% cashback on eligible online categories on transactions of at least ₹100; capped at ₹1,500/billing cycle.' },
      shopping: { ratePercent: 5, monthlyCapRupees: 1500, note: '5% cashback on eligible online categories on transactions of at least ₹100; capped at ₹1,500/billing cycle.' },
      dining: { ratePercent: 10, monthlyCapRupees: 1500, note: '10% cashback across eligible Swiggy Food, Instamart and Dineout, for transactions of at least ₹249; capped at ₹1,500/billing cycle.' },
      grocery: { ratePercent: 10, monthlyCapRupees: 1500, note: 'Modeled for eligible Swiggy Instamart spend with ₹249 transaction minimum under the combined Swiggy cashback cap.' },
      'co-branded': { ratePercent: 10, baseRatePercent: 1, monthlyCapRupees: 1500, note: 'Swiggy co-brand accelerated cashback with 1% eligible other-category cashback.' },
      'low-fee': { ratePercent: 5, monthlyCapRupees: 1500, note: '₹500 annual fee; modeled on eligible online cashback.' },
    },
  },
  {
    id: 'millennia-hdfc',
    issuer: 'HDFC Bank',
    name: 'HDFC Bank Millennia Credit Card',
    annualFeeRupees: 1000,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 100000,
    verifiedAt,
    sourceUrl: 'https://www.hdfc.bank.in/credit-cards/millennia-credit-card',
    sourceLabel: 'Official HDFC Bank product page',
    terms: {
      cashback: { ratePercent: 5, monthlyCapRupees: 1000, note: '5% cashback on listed leading brands; earning cap is 1,000 CashPoints per calendar month, separate from the 3,000-point redemption ceiling.' },
      shopping: { ratePercent: 5, monthlyCapRupees: 1000, note: '5% cashback on listed leading online brands; earning cap is 1,000 CashPoints/calendar month; redemption cap is a separate constraint.' },
      dining: { ratePercent: 5, monthlyCapRupees: 1000, note: 'Modeled for listed eligible brands such as Swiggy/Zomato under the 5% benefit.' },
      fuel: { ratePercent: 0, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 250, network: 'Any', note: '1% fuel surcharge waiver, subject to eligible transaction range and ₹250 statement-cycle cap.' },
      'low-fee': { ratePercent: 5, monthlyCapRupees: 1000, note: '₹1,000 annual fee, waived at ₹1 lakh annual spend.' },
    },
  },
  {
    id: 'tata-neu-infinity-hdfc',
    issuer: 'HDFC Bank',
    name: 'Tata Neu Infinity HDFC Bank Credit Card',
    annualFeeRupees: 1499,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 300000,
    verifiedAt,
    sourceUrl: 'https://www.hdfc.bank.in/credit-cards/tata-neu-infinity-hdfc-bank-credit-card',
    sourceLabel: 'Official HDFC Bank product page',
    terms: {
      'co-branded': { ratePercent: 5, baseRatePercent: 1.5, note: '5% back as NeuCoins on eligible Tata Neu/partner Tata brand spends, plus 1.5% on eligible non-Tata spends.' },
      grocery: { ratePercent: 5, monthlyCapRupees: 2000, note: 'Modeled on eligible Tata/BigBasket ecosystem spend; grocery NeuCoin accrual cap ₹2,000/month.' },
      utilities: { ratePercent: 5, monthlyCapRupees: 2000, note: 'Modeled on eligible Tata Neu utility spending; utility NeuCoin accrual cap ₹2,000/month.' },
      upi: { ratePercent: 1.5, monthlyCapRupees: 500, note: 'Up to 1.5% back as NeuCoins on eligible UPI spend, capped at 500 NeuCoins/month.' },
      lounge: { loungeVisits: 12, note: 'Up to 8 domestic + 4 international lounge accesses/year, subject to spend/quarter conditions.' },
      premium: { ratePercent: 5, loungeVisits: 12, note: 'Premium/co-brand value modeled on eligible Tata ecosystem spend plus stated lounge entitlement.' },
    },
  },
  {
    id: 'tata-neu-infinity-sbi',
    issuer: 'SBI Card',
    name: 'Tata Neu Infinity SBI Card',
    annualFeeRupees: 1499,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 300000,
    verifiedAt,
    sourceUrl: 'https://www.sbicard.com/en/personal/credit-cards/tata-neu-infinity-sbi-card.html',
    sourceLabel: 'Official SBI Card product page',
    terms: {
      'co-branded': { ratePercent: 5, baseRatePercent: 1.5, note: '5% value back as NeuCoins at Tata Neu/partner Tata brands; 1.5% on eligible other/UPI spend.' },
      shopping: { ratePercent: 5, note: 'Modeled on eligible Tata Neu/partner Tata brand shopping.' },
      grocery: { ratePercent: 5, note: 'Modeled on eligible Tata ecosystem grocery spend.' },
      upi: { ratePercent: 1.5, monthlyCapRupees: 500, note: '1.5% value back on eligible UPI transactions on RuPay variant, capped at 500 NeuCoins/month.' },
      forex: { ratePercent: 1.5, forexMarkupPercent: 1.99, note: '1.99% foreign-currency markup; modeled reward offset uses the eligible 1.5% other-spend value-back rate.' },
      lounge: { loungeVisits: 12, note: '8 domestic + 4 international complimentary lounge accesses/year, subject to spend conditions.' },
      premium: { ratePercent: 5, loungeVisits: 12, forexMarkupPercent: 1.99, note: 'Premium value modeled on Tata ecosystem rewards, lounge access and low forex markup.' },
      fuel: { ratePercent: 0, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 500, network: 'Any', note: '1% fuel surcharge waiver, capped at ₹500/statement cycle.' },
    },
  },
  {
    id: 'tata-neu-plus-sbi',
    issuer: 'SBI Card',
    name: 'Tata Neu Plus SBI Card',
    annualFeeRupees: 499,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 100000,
    verifiedAt,
    sourceUrl: 'https://www.sbicard.com/en/personal/credit-cards/tata-neu-plus-sbi-card.html',
    sourceLabel: 'Official SBI Card product page',
    terms: {
      'co-branded': { ratePercent: 2, baseRatePercent: 1, note: '2% value back on Tata Neu/partner Tata brands and 1% eligible other/UPI spends.' },
      shopping: { ratePercent: 2, note: 'Modeled on eligible Tata ecosystem shopping.' },
      upi: { ratePercent: 1, note: '1% value back on eligible UPI transactions.' },
      lounge: { loungeVisits: 4, note: '4 domestic airport lounge accesses/year subject to prior-quarter spend condition.' },
      fuel: { ratePercent: 0, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 250, network: 'Any', note: '1% fuel surcharge waiver, capped at ₹250/statement cycle.' },
      'low-fee': { ratePercent: 2, note: '₹499 annual fee and 2% Tata ecosystem value back.' },
    },
  },
  {
    id: 'flipkart-sbi',
    issuer: 'SBI Card',
    name: 'Flipkart SBI Card',
    annualFeeRupees: 500,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 350000,
    verifiedAt,
    sourceUrl: 'https://www.sbicard.com/en/personal/credit-cards/flipkart-sbi-card.html',
    sourceLabel: 'Official SBI Card product page',
    terms: {
      cashback: { ratePercent: 5, annualCapRupees: 16000, note: '5% cashback on eligible Flipkart spend; official product also advertises 7.5% Myntra and 4% preferred-merchant cashback.' },
      shopping: { ratePercent: 5, annualCapRupees: 16000, note: '5% on eligible Flipkart spend, capped at ₹4,000 per calendar quarter. Annualized model assumes equal monthly spending.' },
      'co-branded': { ratePercent: 5, annualCapRupees: 16000, baseRatePercent: 1, note: 'Flipkart co-brand accelerated cashback plus 1% eligible other-spend cashback; Flipkart component capped at ₹4,000/calendar quarter.' },
      'low-fee': { ratePercent: 5, annualCapRupees: 16000, note: '₹500 annual fee with annual-spend fee reversal and ₹4,000 quarterly Flipkart cashback cap.' },
    },
  },
  {
    id: 'bpcl-sbi-octane',
    issuer: 'SBI Card',
    name: 'BPCL SBI Card OCTANE',
    annualFeeRupees: 1499,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 200000,
    verifiedAt,
    sourceUrl: 'https://www.sbicard.com/en/personal/credit-cards/bpcl-sbi-card-octane.html',
    sourceLabel: 'Official SBI Card product page',
    terms: {
      fuel: { ratePercent: 6.25, monthlyCapRupees: 625, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 100, network: 'BPCL', note: '25 RP/₹100 at BPCL with 4 RP = ₹1 gives 6.25% reward value; plus 1% surcharge waiver. Reward cap modeled from 2,500 RP/billing cycle.' },
      grocery: { ratePercent: 2.5, monthlyCapRupees: 1875, note: '10 RP/₹100, valued at ₹0.25 per point; 7,500 RP shared monthly cap across grocery, dining, department stores and movies. Other-category cap use and any post-cap base accrual are excluded.' },
      dining: { ratePercent: 2.5, monthlyCapRupees: 1875, note: '10 RP/₹100, valued at ₹0.25 per point; 7,500 RP shared monthly cap across grocery, dining, department stores and movies. Other-category cap use and any post-cap base accrual are excluded.' },
      'co-branded': { ratePercent: 6.25, monthlyCapRupees: 625, baseRatePercent: 0.25, note: 'BPCL fuel reward value capped at 2,500 RP/cycle (₹625); surcharge waiver excluded here. Other eligible non-fuel retail earns 1 RP/₹100.' },
    },
  },
  {
    id: 'bpcl-sbi',
    issuer: 'SBI Card',
    name: 'BPCL SBI Card',
    annualFeeRupees: 499,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 100000,
    verifiedAt,
    sourceUrl: 'https://www.sbicard.com/en/personal/credit-cards/bpcl-sbi-card.html',
    sourceLabel: 'Official SBI Card product page',
    terms: {
      fuel: { ratePercent: 3.25, monthlyCapRupees: 325, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 100, network: 'BPCL', note: '13 RP/₹100 at BPCL with 4 RP = ₹1 gives 3.25% reward value; plus 1% surcharge waiver.' },
      grocery: { ratePercent: 1.25, monthlyTiers: [{ upto: 100000, ratePercent: 1.25 }, { ratePercent: 0.25 }], note: 'Shared accelerated limit 5,000 RP/month across grocery, dining, department stores and movies; then 1 RP/₹100. This view assumes no shared-cap use elsewhere; 4 RP = ₹1 fuel value.' },
      dining: { ratePercent: 1.25, monthlyTiers: [{ upto: 100000, ratePercent: 1.25 }, { ratePercent: 0.25 }], note: 'Shared accelerated limit 5,000 RP/month across grocery, dining, department stores and movies; then 1 RP/₹100. This view assumes no shared-cap use elsewhere; 4 RP = ₹1 fuel value.' },
      'co-branded': { ratePercent: 3.25, monthlyCapRupees: 325, baseRatePercent: 0.25, note: 'BPCL fuel reward value capped at 1,300 RP/cycle (₹325); surcharge waiver excluded here. Other eligible non-fuel retail earns 1 RP/₹100.' },
      'low-fee': { ratePercent: 1.25, monthlyTiers: [{ upto: 100000, ratePercent: 1.25 }, { ratePercent: 0.25 }], note: 'Eligible grocery/dining shares a 5,000 RP monthly accelerated cap, then 1 RP/₹100. No other-category cap use assumed.' },
    },
  },
  {
    id: 'first-power-plus',
    issuer: 'IDFC FIRST Bank',
    name: 'FIRST Power+ Credit Card',
    annualFeeRupees: 499,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 150000,
    verifiedAt,
    sourceUrl: 'https://www.idfcfirst.bank.in/credit-card/hpcl-power-fuel-credit-card',
    sourceLabel: 'Official IDFC FIRST Bank credit-card catalogue',
    terms: {
      fuel: { ratePercent: 5, monthlyCapRupees: 600, network: 'HPCL', note: 'Official IDFC FIRST material advertises up to 6.5% savings on HPCL fuel; the cash-value model includes only 5% reward points, capped at ₹600 per cycle. Conditional HP Pay Happy Coins are excluded.' },
      grocery: { ratePercent: 5, monthlyCapRupees: 100, note: 'Official IDFC FIRST material advertises 5% savings on grocery.' },
      utilities: { ratePercent: 5, monthlyCapRupees: 100, note: 'Official IDFC FIRST material advertises 5% savings on utilities.' },
      upi: { ratePercent: 0.5, note: '3 reward points per ₹150 of eligible UPI retail spend at ₹0.25 per point = 0.5%; excluded categories do not earn this rate.' },
      lounge: { loungeVisits: 4, note: '1 complimentary domestic airport lounge visit per quarter, subject to prior-month spend condition.' },
      'co-branded': { ratePercent: 5, monthlyCapRupees: 600, note: 'HPCL card rewards only: 5% capped at ₹600 per cycle; app-specific Happy Coins excluded.' },
      'low-fee': { ratePercent: 5, monthlyCapRupees: 100, note: '₹499 annual fee; modeled using eligible grocery/utility value.' },
    },
  },
  {
    id: 'first-power',
    issuer: 'IDFC FIRST Bank',
    name: 'FIRST Power Credit Card',
    annualFeeRupees: 199,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 50000,
    verifiedAt,
    sourceUrl: 'https://www.idfcfirstbank.com/credit-card',
    sourceLabel: 'Official issuer catalogue; full caps require review',
    terms: {
      fuel: { rankingEligible: false, ratePercent: 5, network: 'HPCL', note: 'Official IDFC FIRST material advertises 5% savings on HPCL fuel.' },
      grocery: { rankingEligible: false, ratePercent: 2.5, note: 'Official IDFC FIRST material advertises 2.5% savings on grocery.' },
      utilities: { rankingEligible: false, ratePercent: 2.5, note: 'Official IDFC FIRST material advertises 2.5% savings on utilities.' },
      'co-branded': { rankingEligible: false, ratePercent: 5, note: 'HPCL co-brand headline fuel savings.' },
      'low-fee': { rankingEligible: false, ratePercent: 2.5, note: '₹199 fee and low annual fee-waiver threshold.' },
      beginner: { rankingEligible: false, ratePercent: 2.5, note: 'Low fee and low waiver threshold; eligibility still depends on issuer approval.' },
    },
  },
  {
    id: 'indianoil-axis',
    issuer: 'Axis Bank',
    name: 'IndianOil Axis Bank Credit Card',
    annualFeeRupees: 500,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 350000,
    verifiedAt,
    sourceUrl: 'https://www.axis.bank.in/cards/credit-card/indianoil-axis-bank-credit-card',
    sourceLabel: 'Official Axis Bank product page',
    terms: {
      fuel: { ratePercent: 4, monthlyCapRupees: 200, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 50, network: 'IndianOil', note: '4% value back on eligible IOCL fuel with ₹5,000 eligible-spend/month ceiling; plus 1% fuel-surcharge waiver capped at ₹50/statement cycle.' },
      shopping: { ratePercent: 1, monthlyCapRupees: 50, note: '1% value back on eligible online shopping up to ₹5,000 eligible spend/month.' },
      'co-branded': { ratePercent: 4, monthlyCapRupees: 200, note: 'Eligible IOCL fuel value back capped at ₹5,000 eligible spend/month (₹200 reward). Only eligible transaction amounts count; surcharge waiver excluded here.' },
      'low-fee': { ratePercent: 1, monthlyCapRupees: 50, note: 'Eligible online shopping rewards have a ₹5,000 eligible monthly spend ceiling (₹50 reward); per-transaction eligibility applies.' },
    },
  },
  {
    id: 'indianoil-hdfc',
    issuer: 'HDFC Bank',
    name: 'IndianOil HDFC Bank Credit Card',
    annualFeeRupees: 500,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 50000,
    verifiedAt,
    sourceUrl: 'https://www.hdfc.bank.in/credit-cards/indianoil-hdfc-bank-credit-card',
    sourceLabel: 'Official HDFC Bank product page',
    terms: {
      fuel: { ratePercent: 4.8, monthlyCapRupees: 144, secondaryRatePercent: 1, secondaryMonthlyCapRupees: 250, network: 'IndianOil', note: '5% of eligible spend earned as Fuel Points at IOCL, worth 4.8% at ₹0.96 per point; recurring cap modeled at 150 Fuel Points/month × ₹0.96 redemption value after first six months, plus 1% surcharge waiver.' },
      grocery: { ratePercent: 4.8, monthlyCapRupees: 96, note: '5% Fuel Points on grocery, capped at 100 Fuel Points/month; 1 FP modeled at ₹0.96, giving a 4.8% rupee-value earning rate.' },
      utilities: { ratePercent: 4.8, monthlyCapRupees: 96, note: '5% Fuel Points on eligible bill payments, capped at 100 Fuel Points/month; 1 FP modeled at ₹0.96, giving a 4.8% rupee-value earning rate.' },
      upi: { ratePercent: 0.64, note: '1 Fuel Point per ₹150 on other eligible purchases including UPI; 1 FP modeled at ₹0.96, giving a 4.8% rupee-value earning rate.' },
      'co-branded': { ratePercent: 4.8, monthlyCapRupees: 144, note: 'IndianOil co-brand fuel-point value modeled using current issuer redemption value.' },
      'low-fee': { ratePercent: 4.8, monthlyCapRupees: 96, note: '₹500 fee; low ₹50,000 fee-waiver threshold.' },
    },
  },
  {
    id: 'sbi-miles',
    issuer: 'SBI Card',
    name: 'SBI Card MILES',
    annualFeeRupees: 1499,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 600000,
    verifiedAt,
    sourceUrl: 'https://www.sbicard.com/en/personal/credit-cards/sbi-card-miles.html',
    sourceLabel: 'Official SBI Card product page',
    terms: {
      travel: { ratePercent: 0.5, loungeVisits: 4, forexMarkupPercent: 3, note: '2 Travel Credits/₹200 on travel. Model values 1 Travel Credit at ₹0.50 for travel-booking redemption; forex markup 3%.' },
      forex: { ratePercent: 0.25, forexMarkupPercent: 3, note: 'Other-spend earning 1 Travel Credit/₹200; 1 TC = ₹0.50 for travel-booking redemption. Forex markup 3%.' },
      lounge: { loungeVisits: 4, note: 'Complimentary domestic lounge access is included in official travel privileges; usage conditions apply.' },
    },
  },
  {
    id: 'sbi-miles-prime',
    issuer: 'SBI Card',
    name: 'SBI Card MILES PRIME',
    annualFeeRupees: 2999,
    feeTaxPercent: 18,
    feeWaiverAnnualSpendRupees: 1000000,
    verifiedAt,
    sourceUrl: 'https://www.sbicard.com/en/personal/credit-cards/sbi-card-miles-prime.html',
    sourceLabel: 'Official SBI Card product page',
    terms: {
      travel: { ratePercent: 1, loungeVisits: 12, forexMarkupPercent: 2.5, note: '4 Travel Credits/₹200 on travel. Model values 1 TC at ₹0.50 for travel-booking redemption; 8 domestic + 4 international lounge visits/year.' },
      forex: { ratePercent: 0.5, forexMarkupPercent: 2.5, note: '2 Travel Credits/₹200 on eligible other spend; 1 TC = ₹0.50 for travel-booking redemption. Forex markup 2.5%.' },
      lounge: { loungeVisits: 12, note: '8 domestic + 4 international complimentary lounge visits/year, subject to program conditions.' },
      premium: { ratePercent: 1, loungeVisits: 12, forexMarkupPercent: 2.5, note: 'Premium travel model using travel-credit value and lounge entitlement.' },
    },
  },
  {
    id: 'indigo-axis',
    issuer: 'Axis Bank',
    name: 'IndiGo Axis Bank Credit Card',
    annualFeeRupees: 799,
    feeTaxPercent: 18,
    verifiedAt,
    sourceUrl: 'https://www.axis.bank.in/cards/credit-card/indigo-axis-bank-credit-card',
    sourceLabel: 'Official Axis Bank product page',
    terms: {
      travel: { rankingEligible: false, ratePercent: 3, loungeVisits: 4, note: '3 IndiGo BluChips/₹100 on IndiGo channels. Model treats 1 BluChip as ₹1 only for ranking normalization; verify redemption value before relying on the estimate.' },
      grocery: { ratePercent: 2, note: '2 IndiGo BluChips/₹100 on eligible grocery. Model treats 1 BluChip as ₹1 for normalized comparison.' },
      dining: { ratePercent: 2, note: '2 IndiGo BluChips/₹100 on eligible dining. Model treats 1 BluChip as ₹1 for normalized comparison.' },
      'co-branded': { rankingEligible: false, ratePercent: 3, note: 'IndiGo co-brand travel earning modeled at 3 BluChips/₹100.' },
      'low-fee': { ratePercent: 2, note: '₹799 annual fee; modeled on accelerated grocery/dining earning.' },
    },
  },
  {
    id: 'indigo-axis-premium',
    issuer: 'Axis Bank',
    name: 'IndiGo Axis Bank Premium Credit Card',
    annualFeeRupees: 5000,
    feeTaxPercent: 18,
    verifiedAt,
    sourceUrl: 'https://www.axis.bank.in/cards/credit-card/indigo-axis-bank-premium-credit-card',
    sourceLabel: 'Official Axis Bank product page',
    terms: {
      travel: { rankingEligible: false, ratePercent: 7, fixedAnnualValueRupees: 5000, note: 'Headline accelerated earn up to 7 IndiGo BluChips/₹100 on IndiGo channels/grocery/hotel categories. Model treats 1 BluChip as ₹1 and includes stated 5,000-BluChip annual benefit at face value.' },
      premium: { rankingEligible: false, ratePercent: 7, fixedAnnualValueRupees: 5000, note: 'Premium travel/co-brand model uses headline BluChip earning and annual renewal BluChip benefit.' },
      'co-branded': { rankingEligible: false, ratePercent: 7, note: 'IndiGo co-brand accelerated earn; rupee redemption value is not verified, so this category is excluded from rupee rankings.' },
    },
  },
  ...additionalVerifiedCards,
  ...secondWaveCards,
]

export const REAL_CARD_DATA_DATE = verifiedAt

export function realCardsForCategory(category: CardCategorySlug) {
  return verifiedRealCards.filter((card) => Boolean(card.terms[category]) && card.terms[category]?.rankingEligible !== false)
}
