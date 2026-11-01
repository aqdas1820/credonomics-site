import type { VerifiedRealCard } from './verified-real-cards'

/**
 * Issuer-backed research catalogue expansion, checked 2026-11-02.
 * Product pages and issuer pricing schedules support the names, fee and notes.
 * All added terms explicitly OPT OUT of reward-value rankings: point conversion,
 * caps, exclusions, and new/legacy terms must be fully modeled separately.
 * Promotional lifetime-free offers are described as conditional where necessary.
 * No affiliate/apply links or product artwork rights are asserted here.
 */
export const additionalVerifiedCards: VerifiedRealCard[] = [
  {
    "id": "simplyclick-sbi",
    "issuer": "SBI Card",
    "name": "SimplyCLICK SBI Card",
    "annualFeeRupees": 499,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 100000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sbicard.com/en/personal/credit-cards/simplyclick-sbi-card.html",
    "sourceLabel": "Official SBI Card product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 10X points on listed online partners and 5X on other eligible online spend; issuer lists 4 points = ₹1. Rate, merchant partners and redemption restrictions must be checked; no rupee-model comparison yet. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "low-fee": {
        "rankingEligible": false,
        "note": "Annual membership fee ₹499 before applicable tax. Standard renewal reversal after eligible ₹1,00,000 annual spend, subject to bank's rules. 10X points on listed online partners and 5X on other eligible online spend; issuer lists 4 points = ₹1. Rate, merchant partners and redemption restrictions must be checked; no rupee-model comparison yet."
      }
    }
  },
  {
    "id": "simplysave-sbi",
    "issuer": "SBI Card",
    "name": "SimplySAVE SBI Card",
    "annualFeeRupees": 499,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 100000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sbicard.com/en/personal/credit-cards/simplysave-sbi-card.html",
    "sourceLabel": "Official SBI Card product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "grocery": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 10 reward points per ₹150 on eligible dining, movies, grocery and departmental stores; 1 point/₹150 on other eligible spend. Issuer lists 4 points = ₹1. Exclusions apply. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "low-fee": {
        "rankingEligible": false,
        "note": "Annual membership fee ₹499 before applicable tax. Standard renewal reversal after eligible ₹1,00,000 annual spend, subject to bank's rules. 10 reward points per ₹150 on eligible dining, movies, grocery and departmental stores; 1 point/₹150 on other eligible spend. Issuer lists 4 points = ₹1. Exclusions apply."
      }
    }
  },
  {
    "id": "sbi-card-prime",
    "issuer": "SBI Card",
    "name": "SBI Card PRIME",
    "annualFeeRupees": 2999,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 300000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sbicard.com/en/personal/sbi-credit-card.page",
    "sourceLabel": "Official SBI Card product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 10 reward points per ₹100 on eligible dining, groceries and departmental stores; issuer advertises domestic/international lounge benefits and spend-linked vouchers. Point value and conditions require separate normalization. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "sbi-card-elite",
    "issuer": "SBI Card",
    "name": "SBI Card ELITE",
    "annualFeeRupees": 4999,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 1000000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sbicard.com/en/personal/credit-cards/sbi-card-elite.html",
    "sourceLabel": "Official SBI Card product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 5X points on eligible dining, grocery and departmental-store spends, 2 points/₹100 elsewhere; separate movie-ticket and milestone benefits. Issuer lists 4 points = ₹1; value is not included in rupee rankings. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "sbi-card-pulse",
    "issuer": "SBI Card",
    "name": "SBI Card PULSE",
    "annualFeeRupees": 1499,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 200000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sbicard.com/en/personal/credit-cards/sbi-card-pulse.html",
    "sourceLabel": "Official SBI Card product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 10 points per ₹100 on eligible pharmacy, sports, dining and movies, 2 points/₹100 elsewhere; 4 domestic lounge visits/year subject to program rules. 4 points = ₹1. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "phonepe-sbi-purple",
    "issuer": "SBI Card",
    "name": "PhonePe SBI Card PURPLE",
    "annualFeeRupees": 499,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 100000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sbicard.com/en/most-important-terms-and-conditions.page",
    "sourceLabel": "Official SBI Card product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "co-branded": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Issuer reward programme: 3 points/₹100 on eligible PhonePe categories (max 1,000 points/month), 2 points/₹100 eligible online (separate 1,000 point cap); ₹100 minimum transaction. RuPay Scan & Pay benefits have separate limits. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "low-fee": {
        "rankingEligible": false,
        "note": "Annual membership fee ₹499 before applicable tax. Standard renewal reversal after eligible ₹1,00,000 annual spend, subject to bank's rules. Issuer reward programme: 3 points/₹100 on eligible PhonePe categories (max 1,000 points/month), 2 points/₹100 eligible online (separate 1,000 point cap); ₹100 minimum transaction. RuPay Scan & Pay benefits have separate limits."
      }
    }
  },
  {
    "id": "phonepe-sbi-select-black",
    "issuer": "SBI Card",
    "name": "PhonePe SBI Card SELECT BLACK",
    "annualFeeRupees": 1499,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 300000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sbicard.com/en/personal/credit-cards/phonepe-sbi-card-select-black.html",
    "sourceLabel": "Official SBI Card product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "co-branded": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 10 points per ₹100 on eligible PhonePe spends, 5 on online and 1 on other spends; issuer lists 1 point = ₹1 and 4 domestic lounge visits/year. Restrictions/limits apply; ranking held until fully normalized. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "sbi-miles-elite",
    "issuer": "SBI Card",
    "name": "SBI Card MILES ELITE",
    "annualFeeRupees": 4999,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 1500000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sbicard.com/en/personal/sbi-credit-card.page",
    "sourceLabel": "Official SBI Card product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Issuer advertises 6 Travel Credits per ₹200 on travel and a 5,000-credit welcome benefit. Travel-credit redemption value varies by route, so not converted into assured rupees. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "indigo-sbi",
    "issuer": "SBI Card",
    "name": "IndiGo SBI Card",
    "annualFeeRupees": 1499,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sbicard.com/en/personal/sbi-credit-card.page",
    "sourceLabel": "Official SBI Card product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Issuer advertises 3% earning on eligible IndiGo spends in BluChips, with welcome/renewal benefits. BluChip redemption conversion has not been normalized. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "indigo-sbi-elite",
    "issuer": "SBI Card",
    "name": "IndiGo SBI Card ELITE",
    "annualFeeRupees": 4999,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sbicard.com/en/personal/sbi-credit-card.page",
    "sourceLabel": "Official SBI Card product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Issuer advertises 7% BluChips on eligible IndiGo spends and 1.99% forex markup; caps, merchant eligibility and BluChip redemption value require separate verification. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "regalia-gold-hdfc",
    "issuer": "HDFC Bank",
    "name": "HDFC Bank Regalia Gold Credit Card",
    "annualFeeRupees": 2500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 400000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.hdfc.bank.in/credit-cards/regalia-gold-credit-card",
    "sourceLabel": "Official HDFC Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Issuer shows 5 reward points/₹200 eligible retail spend; lounge access is conditional on quarterly spend, with 6 international Priority Pass visits/year. Points-to-rupee value varies by redemption. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "diners-privilege-hdfc",
    "issuer": "HDFC Bank",
    "name": "HDFC Bank Diners Club Privilege Credit Card",
    "annualFeeRupees": 1000,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 300000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.hdfc.bank.in/credit-cards/diners-privilege-credit-card",
    "sourceLabel": "Official HDFC Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "dining": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 5X points on eligible Swiggy/Zomato orders, 4 points/₹200 on other eligible spends; post-July 2026 lounge vouchers require ₹60,000 previous-quarter spend. Redemption rates vary. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "low-fee": {
        "rankingEligible": false,
        "note": "Annual membership fee ₹1,000 before applicable tax. Standard renewal reversal after eligible ₹3,00,000 annual spend, subject to bank's rules. 5X points on eligible Swiggy/Zomato orders, 4 points/₹200 on other eligible spends; post-July 2026 lounge vouchers require ₹60,000 previous-quarter spend. Redemption rates vary."
      }
    }
  },
  {
    "id": "freedom-hdfc",
    "issuer": "HDFC Bank",
    "name": "HDFC Bank Freedom Credit Card",
    "annualFeeRupees": 500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 50000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.hdfc.bank.in/credit-cards/freedom-credit-card",
    "sourceLabel": "Official HDFC Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 10X reward points on selected merchants including BigBasket, BookMyShow, OYO, Swiggy and Uber; base 1 point/₹200. Cashback conversion up to ₹0.15/point; conditions vary. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "low-fee": {
        "rankingEligible": false,
        "note": "Annual membership fee ₹500 before applicable tax. Standard renewal reversal after eligible ₹50,000 annual spend, subject to bank's rules. 10X reward points on selected merchants including BigBasket, BookMyShow, OYO, Swiggy and Uber; base 1 point/₹200. Cashback conversion up to ₹0.15/point; conditions vary."
      }
    }
  },
  {
    "id": "moneyback-plus-hdfc",
    "issuer": "HDFC Bank",
    "name": "HDFC Bank MoneyBack+ Credit Card",
    "annualFeeRupees": 500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 50000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.hdfc.bank.in/credit-cards/moneyback-plus-credit-card",
    "sourceLabel": "Official HDFC Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 10X CashPoints on selected brands including Amazon, Flipkart, Swiggy and BigBasket; up to 2.5% value-back under eligible redemption. May 2026 revised terms apply. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "low-fee": {
        "rankingEligible": false,
        "note": "Annual membership fee ₹500 before applicable tax. Standard renewal reversal after eligible ₹50,000 annual spend, subject to bank's rules. 10X CashPoints on selected brands including Amazon, Flipkart, Swiggy and BigBasket; up to 2.5% value-back under eligible redemption. May 2026 revised terms apply."
      }
    }
  },
  {
    "id": "tata-neu-plus-hdfc",
    "issuer": "HDFC Bank",
    "name": "Tata Neu Plus HDFC Bank Credit Card",
    "annualFeeRupees": 499,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 100000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.hdfc.bank.in/credit-cards/tata-neu-plus-hdfc-bank-credit-card",
    "sourceLabel": "Official HDFC Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "co-branded": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 2% back as NeuCoins on eligible Tata partner retail spends; 1% elsewhere. RuPay UPI rewards have separate app-dependent split and 500-NeuCoin monthly cap. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "low-fee": {
        "rankingEligible": false,
        "note": "Annual membership fee ₹499 before applicable tax. Standard renewal reversal after eligible ₹1,00,000 annual spend, subject to bank's rules. 2% back as NeuCoins on eligible Tata partner retail spends; 1% elsewhere. RuPay UPI rewards have separate app-dependent split and 500-NeuCoin monthly cap."
      }
    }
  },
  {
    "id": "diners-black-metal-hdfc",
    "issuer": "HDFC Bank",
    "name": "HDFC Bank Diners Club Black Metal Edition",
    "annualFeeRupees": 10000,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 800000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.hdfc.bank.in/credit-cards/diners-club-black-metal-edition-credit-card",
    "sourceLabel": "Official HDFC Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Diners Club Black Metal offers travel redemptions through SmartBuy up to ₹1/point and quarterly milestone rewards; exact earn/exclusion rules require separate normalization. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "infinia-metal-hdfc",
    "issuer": "HDFC Bank",
    "name": "HDFC Bank Infinia Metal Edition",
    "annualFeeRupees": 12500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 1000000,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.hdfc.bank.in/credit-cards/infinia-credit-card",
    "sourceLabel": "Official HDFC Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Invitation-only premium card, 5 points per ₹150 on eligible spend and 10X on selected SmartBuy spending. Unlimited global lounge entitlement subject to issuer conditions. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "axis-neo",
    "issuer": "Axis Bank",
    "name": "Axis Bank Neo Credit Card",
    "annualFeeRupees": 250,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.axis.bank.in/cards/credit-card/axis-bank-neo-credit-card",
    "sourceLabel": "Official Axis Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "dining": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Zomato, Blinkit, BookMyShow and utilities offers are merchant/coupon-dependent; standard renewal fee ₹250, although select acquisition channels offer lifetime-free terms. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "low-fee": {
        "rankingEligible": false,
        "note": "Annual membership fee ₹250 before applicable tax. No general unconditional renewal waiver is verified. Zomato, Blinkit, BookMyShow and utilities offers are merchant/coupon-dependent; standard renewal fee ₹250, although select acquisition channels offer lifetime-free terms."
      }
    }
  },
  {
    "id": "axis-myzone",
    "issuer": "Axis Bank",
    "name": "Axis Bank MY ZONE Credit Card",
    "annualFeeRupees": 500,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.axis.bank.in/cards/credit-card/axis-bank-my-zone-credit-card",
    "sourceLabel": "Official Axis Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "dining": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — District movie BOGO, Swiggy instant discounts and selected travel offers; standard annual fee ₹500. Conditions revised effective August 2026. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "low-fee": {
        "rankingEligible": false,
        "note": "Annual membership fee ₹500 before applicable tax. No general unconditional renewal waiver is verified. District movie BOGO, Swiggy instant discounts and selected travel offers; standard annual fee ₹500. Conditions revised effective August 2026."
      }
    }
  },
  {
    "id": "axis-horizon",
    "issuer": "Axis Bank",
    "name": "Axis Bank HORIZON Credit Card",
    "annualFeeRupees": 3000,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.axis.bank.in/cards/credit-card/axis-horizon-credit-card",
    "sourceLabel": "Official Axis Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 5 EDGE Miles/₹100 on eligible Travel EDGE or airline websites and 2 miles/₹100 elsewhere; issuer values EDGE Mile at ₹1 under specified redemption. Burgundy-specific fee waivers may apply. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "axis-select",
    "issuer": "Axis Bank",
    "name": "Axis Bank SELECT Credit Card",
    "annualFeeRupees": 3000,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.axis.bank.in/cards/credit-card",
    "sourceLabel": "Official Axis Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Select card offers merchant discounts including BigBasket/Swiggy and EDGE Rewards milestones; standard annual fee ₹3,000, with eligible Burgundy customers potentially exempt. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "axis-magnus",
    "issuer": "Axis Bank",
    "name": "Axis Bank MAGNUS Credit Card",
    "annualFeeRupees": 12500,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.axis.bank.in/cards/credit-card",
    "sourceLabel": "Official Axis Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Issuer lists 5X EDGE Rewards via Travel EDGE, airport-lounge privileges and a joining voucher; annual fee ₹12,500. No guaranteed cash-value ranking without full caps. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "scapia-axis",
    "issuer": "Axis Bank",
    "name": "Scapia Axis Bank Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.axis.bank.in/cards/credit-card/scapia-axis-bank-credit-card",
    "sourceLabel": "Official Axis Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — No joining/annual fee and zero forex markup; 20% Scapia Coins on eligible Scapia bookings and 10% coins on eligible everyday spend. Coins are not cash and have separate redemption rules. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "No recurring annual membership fee per official issuer product page; condition-specific promotions/optional add-ons can differ. No joining/annual fee and zero forex markup; 20% Scapia Coins on eligible Scapia bookings and 10% coins on eligible everyday spend. Coins are not cash and have separate redemption rules."
      }
    }
  },
  {
    "id": "axis-rewards",
    "issuer": "Axis Bank",
    "name": "Axis Bank REWARDS Credit Card",
    "annualFeeRupees": 1000,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.axis.bank.in/cards/credit-card",
    "sourceLabel": "Official Axis Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — 20 EDGE Reward points per ₹125 on eligible apparel/department-store spends. Standard card fee ₹1,000; limited promotional lifetime-free offer on eligible Amex network may differ. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "low-fee": {
        "rankingEligible": false,
        "note": "Annual membership fee ₹1,000 before applicable tax. No general unconditional renewal waiver is verified. 20 EDGE Reward points per ₹125 on eligible apparel/department-store spends. Standard card fee ₹1,000; limited promotional lifetime-free offer on eligible Amex network may differ."
      }
    }
  },
  {
    "id": "first-millennia",
    "issuer": "IDFC FIRST Bank",
    "name": "IDFC FIRST Millennia Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.idfcfirst.bank.in/credit-card/millennia",
    "sourceLabel": "Official IDFC FIRST Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "lifetime-free": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Lifetime-free card; up to 10X reward points on threshold-based eligible spend. International transactions stopped earning reward points effective 26 Oct 2026; a paid UPI add-on is separate. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "first-classic",
    "issuer": "IDFC FIRST Bank",
    "name": "IDFC FIRST Classic Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.idfcfirst.bank.in/credit-card/classic",
    "sourceLabel": "Official IDFC FIRST Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "lifetime-free": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Lifetime-free card; 3X points on selected spend categories and higher rewards subject to thresholds. Issuer lists 1 point/₹200 and ₹0.25 redemption value, with ₹99+GST redemption fee. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "first-select",
    "issuer": "IDFC FIRST Bank",
    "name": "IDFC FIRST Select Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.idfcfirst.bank.in/credit-card/select",
    "sourceLabel": "Official IDFC FIRST Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "lounge": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Lifetime-free, zero forex markup, domestic airport lounge access one per quarter subject to ₹20,000 prior-month spend. No free international lounge entitlement. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "No recurring annual membership fee per official issuer product page; condition-specific promotions/optional add-ons can differ. Lifetime-free, zero forex markup, domestic airport lounge access one per quarter subject to ₹20,000 prior-month spend. No free international lounge entitlement."
      }
    }
  },
  {
    "id": "first-wealth",
    "issuer": "IDFC FIRST Bank",
    "name": "IDFC FIRST Wealth Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.idfcfirst.bank.in/credit-card/wealth",
    "sourceLabel": "Official IDFC FIRST Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Lifetime-free and zero forex markup; up to one domestic plus one international lounge visit per quarter on applicable spend conditions. No reward points on international spends from 26 Oct 2026. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "No recurring annual membership fee per official issuer product page; condition-specific promotions/optional add-ons can differ. Lifetime-free and zero forex markup; up to one domestic plus one international lounge visit per quarter on applicable spend conditions. No reward points on international spends from 26 Oct 2026."
      }
    }
  },
  {
    "id": "first-wow",
    "issuer": "IDFC FIRST Bank",
    "name": "IDFC FIRST WOW! Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.idfcfirst.bank.in/credit-card/wow",
    "sourceLabel": "Official IDFC FIRST Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "forex": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — FD-backed lifetime-free card with zero forex markup and points on eligible international and domestic transactions; optional UPI digital card has separate ₹199+GST charge. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "No recurring annual membership fee per official issuer product page; condition-specific promotions/optional add-ons can differ. FD-backed lifetime-free card with zero forex markup and points on eligible international and domestic transactions; optional UPI digital card has separate ₹199+GST charge."
      }
    }
  },
  {
    "id": "ixigo-au",
    "issuer": "AU Small Finance Bank",
    "name": "ixigo AU Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.au.bank.in/personal-banking/credit-cards/ixigo-au-credit-card",
    "sourceLabel": "Official AU Small Finance Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Limited-period lifetime-free offer; zero forex markup, travel discounts on ixigo and spend-dependent railway/airport lounge access. Reward points require redemption conversion check. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "No recurring annual membership fee per official issuer product page; condition-specific promotions/optional add-ons can differ. Limited-period lifetime-free offer; zero forex markup, travel discounts on ixigo and spend-dependent railway/airport lounge access. Reward points require redemption conversion check."
      }
    }
  },
  {
    "id": "platinum-chip-icici",
    "issuer": "ICICI Bank",
    "name": "ICICI Bank Platinum Chip Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://campaigns.icicibank.com/credit-card/noFee/index.html",
    "sourceLabel": "Official ICICI Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "lifetime-free": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — ICICI's official no-fee campaign lists Platinum Chip with no joining or annual fees subject to eligibility; earns points under the applicable reward programme and offers fuel surcharge waiver. Not included in automated net-value rankings until complete reward and cap normalization."
      }
    }
  },
  {
    "id": "legend-indusind",
    "issuer": "IndusInd Bank",
    "name": "IndusInd Bank Legend Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.indusind.com/in/en/personal/cards/credit-card/legend-credit-card.html",
    "sourceLabel": "Official IndusInd Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Official catalogue lists Legend as lifetime-free; one reward point/₹100 weekday and two on weekends. International markup 1.8%; complimentary lounge access ended 7 March 2025. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "No recurring annual membership fee per official issuer product page; condition-specific promotions/optional add-ons can differ. Official catalogue lists Legend as lifetime-free; one reward point/₹100 weekday and two on weekends. International markup 1.8%; complimentary lounge access ended 7 March 2025."
      }
    }
  },
  {
    "id": "platinum-rupay-indusind",
    "issuer": "IndusInd Bank",
    "name": "IndusInd Bank Platinum RuPay Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.indusind.com/in/en/personal/cards/credit-card.html",
    "sourceLabel": "Official IndusInd Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "upi": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Official IndusInd catalogue lists this card lifetime-free, enabled for eligible RuPay credit-on-UPI transactions, earning two reward points/₹100 eligible UPI spend. Point redemption needs checking. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "No recurring annual membership fee per official issuer product page; condition-specific promotions/optional add-ons can differ. Official IndusInd catalogue lists this card lifetime-free, enabled for eligible RuPay credit-on-UPI transactions, earning two reward points/₹100 eligible UPI spend. Point redemption needs checking."
      }
    }
  },
  {
    "id": "eazydiner-platinum-indusind",
    "issuer": "IndusInd Bank",
    "name": "EazyDiner IndusInd Bank Platinum Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.indusind.com/in/en/personal/cards/credit-card.html",
    "sourceLabel": "Official IndusInd Bank product information / fee schedule",
    "catalogueOnly": true,
    "terms": {
      "dining": {
        "rankingEligible": false,
        "note": "Issuer-verified catalogue only — Official IndusInd catalogue lists the co-brand Platinum as lifetime-free; EazyDiner restaurant discounts have limits, frequency restrictions and Prime membership rules. Not included in automated net-value rankings until complete reward and cap normalization."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "No recurring annual membership fee per official issuer product page; condition-specific promotions/optional add-ons can differ. Official IndusInd catalogue lists the co-brand Platinum as lifetime-free; EazyDiner restaurant discounts have limits, frequency restrictions and Prime membership rules."
      }
    }
  }
]
