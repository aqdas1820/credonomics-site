import type { VerifiedRealCard } from './verified-real-cards'

/**
 * 2026-11-02 issuer-source-backed follow-up catalogue.
 * Standard ANNUAL (renewal) membership cost is shown, not first-year/joining
 * cost. Conditional lifetime-free promotions, card-availability restrictions
 * and first-year charges are explicit in feeNote. All reward-rate comparisons
 * remain disabled until caps, exclusions, eligibility and redemption values
 * are individually normalized and independently verified.
 */
export const secondWaveCards: VerifiedRealCard[] = [
  {
    "id": "kotak-811",
    "issuer": "Kotak Mahindra Bank",
    "name": "Kotak 811 Credit Card",
    "annualFeeRupees": 500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 50000,
    "feeNote": "₹500 standard recurring annual fee; waiver at ₹50,000 eligible retail spends.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards/kotak-811-credit-card.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. 2 reward points per ₹100 eligible online spending and 1 per ₹100 eligible offline. Reward exclusions and June 2025 utility restrictions apply."
      }
    }
  },
  {
    "id": "kotak-league-platinum",
    "issuer": "Kotak Mahindra Bank",
    "name": "Kotak League Platinum Credit Card",
    "annualFeeRupees": 499,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 50000,
    "feeNote": "Standard renewal fee ₹499 under fee schedule; targeted ₹0 joining/annual fee offers may supersede it.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards/league-platinum-card.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Up to 8 rewards per ₹150 in qualifying categories and spend-linked movie-ticket milestones. Select acquisition channels show lifetime-free pricing; standard fee disclosures may show ₹499."
      }
    }
  },
  {
    "id": "kotak-air",
    "issuer": "Kotak Mahindra Bank",
    "name": "Kotak Air Credit Card",
    "annualFeeRupees": 999,
    "feeTaxPercent": 18,
    "feeNote": "₹999 annual fee listed in Kotak's product catalogue.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Kotak Unbox travel bookings can earn accelerated Air Miles; airline transfer and redemption valuation are separate from cashback."
      }
    }
  },
  {
    "id": "kotak-air-plus",
    "issuer": "Kotak Mahindra Bank",
    "name": "Kotak Air+ Credit Card",
    "annualFeeRupees": 3000,
    "feeTaxPercent": 18,
    "feeNote": "₹3,000 annual fee listed on Kotak's issuer catalogue.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Accelerated Air Miles on Kotak Unbox travel bookings, selected lounge privileges and advertised 2% forex markup; transfer values/caps need verification."
      }
    }
  },
  {
    "id": "indianoil-kotak",
    "issuer": "Kotak Mahindra Bank",
    "name": "IndianOil Kotak Credit Card",
    "annualFeeRupees": 449,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 50000,
    "feeNote": "₹449 standard fee, annual waiver at ₹50,000 eligible spend.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "fuel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Issuer advertises fuel savings at IndianOil stations and reward points for eligible grocery/dining. Fuel reward rules and station eligibility require detailed validation."
      }
    }
  },
  {
    "id": "pvr-inox-kotak",
    "issuer": "Kotak Mahindra Bank",
    "name": "PVR INOX Kotak Credit Card",
    "annualFeeRupees": 499,
    "feeTaxPercent": 18,
    "feeNote": "₹499 annual fee; verify current cinema ticket terms.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "dining": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Spend-based cinema ticket benefits and concession discounts at eligible PVR INOX locations. Benefits depend on redemption and transaction requirements."
      }
    }
  },
  {
    "id": "indigo-kotak",
    "issuer": "Kotak Mahindra Bank",
    "name": "IndiGo Kotak Credit Card",
    "annualFeeRupees": 1500,
    "feeTaxPercent": 18,
    "feeNote": "₹1,500 annual fee. Airline vouchers are conditional.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. BluChips and airline vouchers advertised for eligible IndiGo bookings. BluChip cash conversion and annual milestone conditions not normalized."
      }
    }
  },
  {
    "id": "indigo-kotak-premium",
    "issuer": "Kotak Mahindra Bank",
    "name": "IndiGo Kotak Premium Credit Card",
    "annualFeeRupees": 3000,
    "feeTaxPercent": 18,
    "feeNote": "₹3,000 standard annual fee listed in Kotak's official catalogue; promotional joining or renewal offers may vary.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Premium IndiGo co-brand benefits, accelerated BluChip earning and qualifying milestones. No fixed ₹ valuation for BluChips is asserted."
      }
    }
  },
  {
    "id": "kotak-white",
    "issuer": "Kotak Mahindra Bank",
    "name": "Kotak White Credit Card",
    "annualFeeRupees": 3000,
    "feeTaxPercent": 18,
    "feeNote": "₹3,000 standard annual fee; qualifying spend rewards are not equivalent to uncapped cashback.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Milestone-linked White Pass voucher benefits, subject to annual spend thresholds and issuer partner terms."
      }
    }
  },
  {
    "id": "kotak-white-reserve",
    "issuer": "Kotak Mahindra Bank",
    "name": "Kotak White Reserve Credit Card",
    "annualFeeRupees": 12500,
    "feeTaxPercent": 18,
    "feeNote": "₹12,500 standard annual fee shown on Kotak issuer catalogue.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Premium travel privileges, lounge access and White Pass milestones, subject to the White Reserve programme conditions."
      }
    }
  },
  {
    "id": "kotak-upi-rupay",
    "issuer": "Kotak Mahindra Bank",
    "name": "Kotak UPI RuPay Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "feeNote": "Listed with nil joining and annual fee; credit-on-UPI is available only where eligible.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "upi": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Virtual RuPay credit-on-UPI card; issuer advertises 3 reward points per ₹100 of eligible spends. UPI merchant exclusions apply."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "Published standard renewal fee ₹0, subject to issuer eligibility and product rules. Listed with nil joining and annual fee; credit-on-UPI is available only where eligible."
      }
    }
  },
  {
    "id": "kotak-zen",
    "issuer": "Kotak Mahindra Bank",
    "name": "Kotak Zen Credit Card",
    "annualFeeRupees": 1500,
    "feeTaxPercent": 18,
    "feeNote": "₹1,500 annual fee shown on issuer product catalogue.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Zen reward points for eligible shopping and other spends, subject to programme redemption values and excluded merchant categories."
      }
    }
  },
  {
    "id": "kotak-811-dream-different",
    "issuer": "Kotak Mahindra Bank",
    "name": "Kotak 811 Dream Different Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "feeNote": "Annual fee ₹0, but an initial joining fee may apply; not universally fee-free in year one.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.kotak.bank.in/en/personal-banking/cards/credit-cards.html",
    "sourceLabel": "Official Kotak Mahindra Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "beginner": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. FD-backed variant with selectable credit limit; annual membership ₹0 but issuer advertises a possible ₹250 joining fee."
      }
    }
  },
  {
    "id": "icici-coral",
    "issuer": "ICICI Bank",
    "name": "ICICI Bank Coral Credit Card",
    "annualFeeRupees": 500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 150000,
    "feeNote": "Standard ₹500 annual membership; certain alumni/employee offers waive both joining and annual fees.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://campaigns.icicibank.com/credit-card/coralCreditCard/index.html",
    "sourceLabel": "Official ICICI Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Movie-ticket discounts and conditional domestic lounge access. ICICI alumni/corporate offers may make this card lifetime-free for specifically eligible applicants."
      }
    }
  },
  {
    "id": "icici-rubyx",
    "issuer": "ICICI Bank",
    "name": "ICICI Bank Rubyx Credit Card",
    "annualFeeRupees": 2000,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 300000,
    "feeNote": "Annual fee ₹2,000; joining fee ₹3,000; annual waiver above ₹3 lakh qualifying spend.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.icici.bank.in/personal-banking/cards/credit-card/rubyx-credit-card",
    "sourceLabel": "Official ICICI Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "lounge": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Premium movie, domestic lounge and reward privileges with spend conditions; rewards are not yet converted to a reliable net value."
      }
    }
  },
  {
    "id": "icici-sapphiro",
    "issuer": "ICICI Bank",
    "name": "ICICI Bank Sapphiro Credit Card",
    "annualFeeRupees": 3500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 600000,
    "feeNote": "Annual fee ₹3,500; joining fee ₹6,500. Certain customer-specific alumni or salary programmes may offer free issuance.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.icici.bank.in/personal-banking/cards/credit-card/sapphiro-card",
    "sourceLabel": "Official ICICI Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Domestic and international lounge privileges with qualifying-spend conditions, movie rewards and welcome vouchers; voucher face values are not cash."
      }
    }
  },
  {
    "id": "icici-hpcl-super-saver",
    "issuer": "ICICI Bank",
    "name": "ICICI Bank HPCL Super Saver Credit Card",
    "annualFeeRupees": 500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 150000,
    "feeNote": "Standard ₹500 annual fee; waiver above ₹1.5 lakh qualifying annual spend.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.icici.bank.in/personal-banking/cards/credit-card/hpcl-super-saver",
    "sourceLabel": "Official ICICI Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "fuel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Issuer advertises eligible HPCL fuel savings, and points on daily essentials; reward station and MCC restrictions apply."
      }
    }
  },
  {
    "id": "rbl-shoprite",
    "issuer": "RBL Bank",
    "name": "RBL Bank ShopRite Credit Card",
    "annualFeeRupees": 500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 150000,
    "feeNote": "Standard ₹500 annual fee; bank's fee schedule shows renewal waiver above ₹1.5 lakh eligible spend.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.rbl.bank.in/personal-banking/cards/credit-cards/category",
    "sourceLabel": "Official RBL Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "grocery": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Issuer advertises grocery value back and BookMyShow movie discounts. Specific monthly caps, qualifying spends and point conversions require normalization."
      }
    }
  },
  {
    "id": "rbl-world-safari",
    "issuer": "RBL Bank",
    "name": "RBL Bank World Safari Credit Card",
    "annualFeeRupees": 3000,
    "feeTaxPercent": 18,
    "feeNote": "₹3,000 annual membership according to issuer schedule of charges.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.rbl.bank.in/personal-banking/cards/credit-cards/category",
    "sourceLabel": "Official RBL Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Travel-oriented forex and lounge benefits; usage rules and waiver eligibility must be read against the variant-specific terms."
      }
    }
  },
  {
    "id": "rbl-platinum-maxima",
    "issuer": "RBL Bank",
    "name": "RBL Bank Platinum Maxima Credit Card",
    "annualFeeRupees": 2000,
    "feeTaxPercent": 18,
    "feeNote": "₹2,000 annual membership per issuer fee schedule.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.rbl.bank.in/personal-banking/cards/credit-cards/category",
    "sourceLabel": "Official RBL Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Issuer's Platinum Maxima product has spend-linked movie, travel and reward benefits with separate exclusions."
      }
    }
  },
  {
    "id": "rbl-bankbazaar-savemax",
    "issuer": "RBL Bank",
    "name": "RBL Bank BankBazaar SaveMax Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "feeNote": "Issuer fee schedule lists nil first-year and renewal annual fee.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.rbl.bank.in/personal-banking/cards/credit-cards/category",
    "sourceLabel": "Official RBL Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "lifetime-free": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Issuer describes BookMyShow discounts and rewards at selected food, grocery and online merchants; qualifying merchant and programme restrictions apply."
      }
    }
  },
  {
    "id": "rbl-bankbazaar-savemax-pro",
    "issuer": "RBL Bank",
    "name": "RBL Bank BankBazaar SaveMax Pro Credit Card",
    "annualFeeRupees": 1499,
    "feeTaxPercent": 18,
    "feeNote": "₹1,499 standard annual fee in the official RBL schedule; customer-specific offers may differ.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.rbl.bank.in/personal-banking/cards/credit-cards/category",
    "sourceLabel": "Official RBL Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Higher qualifying shopping reward-point multipliers than standard SaveMax; cashback equivalence remains unmodeled."
      }
    }
  },
  {
    "id": "rbl-paisabazaar-duet",
    "issuer": "RBL Bank",
    "name": "RBL Bank Paisabazaar Duet Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "feeNote": "Current issued Duet: nil annual membership. Older pre-2021 cards may differ.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.rbl.bank.in/personal-banking/cards/credit-cards/category",
    "sourceLabel": "Official RBL Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "cashback": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. The current no-fee Duet product advertises cashback benefits; older accounts opened before policy cutoffs can have different fees."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "Published standard renewal fee ₹0, subject to issuer eligibility and product rules. Current issued Duet: nil annual membership. Older pre-2021 cards may differ."
      }
    }
  },
  {
    "id": "rbl-play",
    "issuer": "RBL Bank",
    "name": "RBL Bank Play Credit Card",
    "annualFeeRupees": 500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 150000,
    "feeNote": "₹500 standard renewal fee, conditionally waived after ₹1.5 lakh eligible annual spend.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.rbl.bank.in/personal-banking/cards/credit-cards/category",
    "sourceLabel": "Official RBL Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Issuer has spend-linked Play card rewards and partner benefits; check variant and current eligibility before assigning a cash value."
      }
    }
  },
  {
    "id": "yes-marquee",
    "issuer": "YES BANK",
    "name": "YES BANK MARQUEE Credit Card",
    "annualFeeRupees": 4999,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 1000000,
    "feeNote": "₹9,999 first-year joining; ₹4,999 renewal; renewal waiver at ₹10 lakh qualifying spend.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.yes.bank.in/personal-banking/yes-individual/cards/credit-cards",
    "sourceLabel": "Official YES BANK product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Bank advertises premium airport-lounge, movie and YES Rewardz privileges. High joining fee and point conversion need separate valuation."
      }
    }
  },
  {
    "id": "yes-reserv",
    "issuer": "YES BANK",
    "name": "YES BANK RESERV Credit Card",
    "annualFeeRupees": 2499,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 300000,
    "feeNote": "₹2,499 joining and renewal; first-year waiver on qualifying ₹40,000 first-month spend; renewal at ₹3 lakh.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.yes.bank.in/personal-banking/yes-individual/cards/credit-cards",
    "sourceLabel": "Official YES BANK product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Premium reward-point earning on qualified online transactions and lounge privileges; eligibility and reward caps vary."
      }
    }
  },
  {
    "id": "yes-elite-plus",
    "issuer": "YES BANK",
    "name": "YES BANK ELITE+ Credit Card",
    "annualFeeRupees": 999,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 200000,
    "feeNote": "₹999 joining/renewal fee; first-month and ₹2 lakh annual waiver conditions may apply.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.yes.bank.in/personal-banking/yes-individual/cards/credit-cards",
    "sourceLabel": "Official YES BANK product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Rewardz-based card with merchant-category and selected lifestyle benefits; no standardized rupee reward valuation yet."
      }
    }
  },
  {
    "id": "yes-select",
    "issuer": "YES BANK",
    "name": "YES BANK SELECT Credit Card",
    "annualFeeRupees": 599,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 100000,
    "feeNote": "₹599 standard fee, annual waiver after ₹1 lakh qualifying retail spend.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.yes.bank.in/personal-banking/yes-individual/cards/credit-cards",
    "sourceLabel": "Official YES BANK product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Reward and merchant-offer benefits are conditional on the issuer's currently published programme and applicable card tier."
      }
    }
  },
  {
    "id": "yes-ace",
    "issuer": "YES BANK",
    "name": "YES BANK ACE Credit Card",
    "annualFeeRupees": 499,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 50000,
    "feeNote": "₹499 standard membership; renewal waiver threshold ₹50,000 eligible spend.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.yes.bank.in/personal-banking/yes-individual/cards/credit-cards",
    "sourceLabel": "Official YES BANK product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "low-fee": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Entry-level YES Rewardz card with selected merchant offers; ranking awaits point valuation and exclusion details."
      }
    }
  },
  {
    "id": "yes-rupay",
    "issuer": "YES BANK",
    "name": "YES BANK RuPay Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "feeNote": "YES BANK key-facts statement lists nil annual and joining fee for standard RuPay Card.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.yes.bank.in/personal-banking/yes-individual/cards/credit-cards",
    "sourceLabel": "Official YES BANK product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "upi": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Virtual RuPay credit-card product for eligible credit-on-UPI merchant transactions; issuer eligibility and reward terms govern usage."
      },
      "lifetime-free": {
        "rankingEligible": false,
        "note": "Published standard renewal fee ₹0, subject to issuer eligibility and product rules. YES BANK key-facts statement lists nil annual and joining fee for standard RuPay Card."
      }
    }
  },
  {
    "id": "yes-ai-inside",
    "issuer": "YES BANK",
    "name": "YES BANK AI Inside Credit Card",
    "annualFeeRupees": 0,
    "feeTaxPercent": 18,
    "feeNote": "Issuer fee schedule lists nil standard annual membership; check current issuance availability.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.yes.bank.in/personal-banking/yes-individual/cards/credit-cards",
    "sourceLabel": "Official YES BANK product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "lifetime-free": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Issuer key-fact schedule lists the AI Inside product; exact reward-programme features and eligibility remain under review."
      }
    }
  },
  {
    "id": "federal-signet",
    "issuer": "Federal Bank",
    "name": "Federal Bank Signet Credit Card",
    "annualFeeRupees": 750,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 75000,
    "feeNote": "Standard KFS lists ₹750/year with waiver at ₹75,000; limited-period promotional LTF issuance may override.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.federal.bank.in/rupay-signet-credit-card",
    "sourceLabel": "Official Federal Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Signet card includes reward-points and issuer offers. Federal advertises a limited-period lifetime-free offer that may supersede the standard fee schedule."
      }
    }
  },
  {
    "id": "federal-imperio",
    "issuer": "Federal Bank",
    "name": "Federal Bank Imperio Credit Card",
    "annualFeeRupees": 1500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 150000,
    "feeNote": "Historical standard KFS ₹1,500/year, waiver at ₹1.5 lakh; issuer currently advertises limited-period lifetime-free issuance.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.federal.bank.in/visa-imperio-credit-card",
    "sourceLabel": "Official Federal Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "dining": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Imperio card offers points and conditional domestic lounge access; standard fee schedule and current promotional LTF terms differ."
      }
    }
  },
  {
    "id": "federal-celesta",
    "issuer": "Federal Bank",
    "name": "Federal Bank Celesta Credit Card",
    "annualFeeRupees": 3000,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 300000,
    "feeNote": "Historical standard KFS ₹3,000/year with waiver at ₹3 lakh; current limited-period LTF marketing requires eligibility confirmation.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.federal.bank.in/credit-cards",
    "sourceLabel": "Official Federal Bank product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Celesta premium product with travel/lounge and partner offers; actual effective fees may be waived under the bank's limited-period LTF campaign."
      }
    }
  },
  {
    "id": "amex-smartearn",
    "issuer": "American Express India",
    "name": "American Express SmartEarn Credit Card",
    "annualFeeRupees": 495,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 40000,
    "feeNote": "₹495 recurring annual membership; renewal waiver on ₹40,000 qualifying previous-year spend. New applications temporarily paused.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.americanexpress.com/in/credit-cards/smart-earn-credit-card/",
    "sourceLabel": "Official American Express India product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Accelerated Membership Rewards points at listed online merchants; American Express has published a temporary pause on accepting new India card applications."
      }
    }
  },
  {
    "id": "amex-membership-rewards",
    "issuer": "American Express India",
    "name": "American Express Membership Rewards Credit Card",
    "annualFeeRupees": 4500,
    "feeTaxPercent": 18,
    "feeWaiverAnnualSpendRupees": 150000,
    "feeNote": "₹1,000 first year, ₹4,500 recurring; renewal may be fully waived at ₹1.5 lakh qualifying yearly spend.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.americanexpress.com/in/credit-cards/membership-rewards-card/",
    "sourceLabel": "Official American Express India product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. MR-points membership and spend milestones require enrollment and specific qualifying transaction amounts; application intake temporarily paused."
      }
    }
  },
  {
    "id": "amex-platinum-travel",
    "issuer": "American Express India",
    "name": "American Express Platinum Travel Credit Card",
    "annualFeeRupees": 5000,
    "feeTaxPercent": 18,
    "feeNote": "₹5,000 annual fee; joining vouchers and milestone points not modeled as cash.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.americanexpress.com/in/credit-cards/platinum-travel-credit-card/",
    "sourceLabel": "Official American Express India product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Membership Rewards milestones and lounge/travel benefits depend on spend. Issuer currently warns that new applications are temporarily paused."
      }
    }
  },
  {
    "id": "amex-platinum-reserve",
    "issuer": "American Express India",
    "name": "American Express Platinum Reserve Credit Card",
    "annualFeeRupees": 10000,
    "feeTaxPercent": 18,
    "feeNote": "₹10,000 annual fee under standard published option; alternative foundation-fee programme can differ.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.americanexpress.com/in/credit-know-how/credit-card-fees/",
    "sourceLabel": "Official American Express India product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Premium travel and lifestyle privileges; check which first-year vs renewal fee option is offered. Issuer warns of temporary application intake pause."
      }
    }
  },
  {
    "id": "sc-easemytrip",
    "issuer": "Standard Chartered India",
    "name": "Standard Chartered EaseMyTrip Credit Card",
    "annualFeeRupees": 350,
    "feeTaxPercent": 18,
    "feeNote": "₹350 standard annual fee per Standard Chartered tariff schedule.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sc.bank.in/credit-cards/tariffs-and-charges/",
    "sourceLabel": "Official Standard Chartered India product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "travel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Travel booking promotions and lounge benefits with qualifying merchant/spend criteria; rewards not converted to guaranteed monetary value."
      }
    }
  },
  {
    "id": "sc-smart",
    "issuer": "Standard Chartered India",
    "name": "Standard Chartered Smart Credit Card",
    "annualFeeRupees": 499,
    "feeTaxPercent": 18,
    "feeNote": "₹499 annual fee in issuer tariff schedule; cashback excludes selected MCCs and may have caps.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sc.bank.in/credit-cards/",
    "sourceLabel": "Official Standard Chartered India product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "cashback": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Bank advertises 2% cashback on qualifying online and 1% on other spends, subject to category restrictions and capped rewards."
      }
    }
  },
  {
    "id": "sc-platinum-rewards",
    "issuer": "Standard Chartered India",
    "name": "Standard Chartered Platinum Rewards Credit Card",
    "annualFeeRupees": 250,
    "feeTaxPercent": 18,
    "feeNote": "₹250 standard annual fee in issuer published tariff.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sc.bank.in/credit-cards/tariffs-and-charges/",
    "sourceLabel": "Official Standard Chartered India product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Accelerated reward points on qualifying dining and fuel spending; currency value depends on redemption programme."
      }
    }
  },
  {
    "id": "sc-supervalue-titanium",
    "issuer": "Standard Chartered India",
    "name": "Standard Chartered SuperValue Titanium Credit Card",
    "annualFeeRupees": 750,
    "feeTaxPercent": 18,
    "feeNote": "₹750 standard annual membership in the bank's published tariff; promotional offers may differ.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sc.bank.in/credit-cards/tariffs-and-charges/",
    "sourceLabel": "Official Standard Chartered India product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "fuel": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Fuel cashback and telecom/utility rewards subject to selected merchant and period conditions; cashback ceiling not yet modeled."
      }
    }
  },
  {
    "id": "sc-ultimate",
    "issuer": "Standard Chartered India",
    "name": "Standard Chartered Ultimate Credit Card",
    "annualFeeRupees": 5000,
    "feeTaxPercent": 18,
    "feeNote": "₹5,000 annual fee in Standard Chartered's published tariff, before applicable tax.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sc.bank.in/credit-cards/",
    "sourceLabel": "Official Standard Chartered India product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "premium": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Issuer lists 5 reward points/₹150 eligible spend, 1:1 point-value redemption for some uses, plus conditional airport lounges."
      }
    }
  },
  {
    "id": "sc-rewards",
    "issuer": "Standard Chartered India",
    "name": "Standard Chartered Rewards Credit Card",
    "annualFeeRupees": 1000,
    "feeTaxPercent": 18,
    "feeNote": "₹0 first year; ₹1,000 subsequent annual fee in bank tariff.",
    "verifiedAt": "2026-11-02",
    "sourceUrl": "https://www.sc.bank.in/credit-cards/tariffs-and-charges/",
    "sourceLabel": "Official Standard Chartered India product catalogue / schedule of charges",
    "catalogueOnly": true,
    "terms": {
      "shopping": {
        "rankingEligible": false,
        "note": "Issuer-referenced catalogue; value-model not yet normalized. Rewards Credit Card annual membership is waived in year one but renews on standard fee; reward conversion depends on programme terms."
      }
    }
  }
]
