export const WATCH_CHECKED_AT = '2026-10-24'
export type WatchItem = {
  slug: string; title: string; summary: string; category: 'Credit cards' | 'Mutual funds'
  checkedAt: string; eventDate: string; dateLabel: string; source: string; sourceLabel: string
  sourceLocation: string; audience: string; facts: string[]; actions: string[]; limits: string
  cardIds?: string[]
}

/** Editorial snapshots. Future notices do not change the ranking engine before their effective dates. */
export const researchWatch: WatchItem[] = [
  {
    slug: 'idfc-indigo-international-rewards-october-2026',
    title: 'IndiGo IDFC FIRST: international reward rule changes on 26 October',
    summary: 'The issuer specifies 1 BluChip per ₹100 on international purchases from 26 October 2026.',
    category: 'Credit cards', checkedAt: '2026-10-24', eventDate: '2026-10-26', dateLabel: 'Reward rule effective',
    source: 'https://www.idfcfirst.bank.in/credit-card/indigo-credit-card', sourceLabel: 'IDFC FIRST Bank: IndiGo Dual card FAQ', sourceLocation: 'How will I earn IndiGo BluChips on My Card?',
    audience: 'IndiGo IDFC FIRST Dual cardholders planning international purchases.',
    facts: ['The issuer FAQ announces 1 IndiGo BluChip for every ₹100 of international purchases from 26 October 2026.', 'BluChips are a reward currency; their flight-redemption value varies. A count of points is not an equivalent rupee cashback percentage.'],
    actions: ['Check the international-purchase rule before comparing cards for a foreign-currency purchase.', 'Use a realistic redemption value and applicable charges when estimating net value.'],
    limits: 'Upcoming at the check date. This notice concerns the IDFC FIRST co-brand, not Axis IndiGo cards. No fixed ₹1-per-BluChip assumption or new rupee ranking is introduced.',
  },
  {
    slug: 'amex-november-2026-fees-and-service-dates',
    title: 'Amex November changes: fee waiver, late fees and application dates',
    summary: 'Check the 27 October application pause and the benefit changes effective from 15 November.',
    category: 'Credit cards', checkedAt: '2026-10-24', eventDate: '2026-11-15', dateLabel: 'Benefit changes effective',
    source: 'https://www.americanexpress.com/en-in/support/digital/consumer-experience-updates/', sourceLabel: 'American Express India: Consumer Experience Updates', sourceLocation: 'Annual Fee Waiver; Supplementary Cards; Changes to Late Payment Fee',
    audience: 'Existing Amex India cardholders and people planning supplementary-card applications.',
    facts: ['From 15 November 2026, Membership Rewards Credit Card (MRCC) loses the 50% annual-fee waiver tied to ₹90,000 membership-year spending.', 'Revised credit-card late fees use Total Amount Due, with slabs of ₹500–₹1,250. Amex specifies statements generated after 15 November; this revision excludes charge cards.', 'New supplementary-card applications pause from 27 October; Amex asks applicants to apply before that date and complete by 3 November.'],
    actions: ['Review the official product-specific notice before relying on a fee waiver.', 'If already planning a supplementary card, check the application dates. Keep payments on schedule during the upgrade.'],
    limits: 'Product conditions differ. The notice does not establish removal of every Amex fee-waiver benefit. Check Amex for temporary service disruptions and the applicable MITC.',
  },
  {
    slug: 'hdfc-fund-covered-call-exit-window-november-2026',
    title: 'Two HDFC schemes: optional exit window closes at 3 pm on 6 November',
    summary: 'Balanced Advantage and Children’s Fund add a covered-call strategy from 9 November; eligible holders have a limited optional exit window.',
    category: 'Mutual funds', checkedAt: '2026-10-24', eventDate: '2026-11-06', dateLabel: 'Optional exit deadline · 3:00 pm IST',
    source: 'https://files.hdfcfund.com/s3fs-public/2026-10/1370%20-%20Notice%20cum%20Addendum%20-%20Change%20in%20Fundamental%20attributes%20of%20Schemes%20-%20w.e.f.%20-%20November%2009,%202026.pdf', sourceLabel: 'HDFC Mutual Fund: Notice 1370', sourceLocation: 'Pages 1–3; Exit Option on page 3',
    audience: 'Eligible existing unitholders of HDFC Balanced Advantage Fund and HDFC Children’s Fund.',
    facts: ['The two schemes introduce a covered-call strategy from 9 November 2026 as a fundamental-attribute change.', 'For eligible holders whose valid applications reached the fund by 3 pm on 1 October, the optional exit-load-free window runs from 8 October until 3 pm on 6 November. Applicable NAV and cut-off rules still apply.'],
    actions: ['Read the notice against your exact scheme and holding eligibility before deciding.', 'If you choose the optional exit, check the official submission process, lock-in and encumbrance conditions in advance.'],
    limits: 'This is not a recommendation to redeem. Children’s Fund lock-in, pledged/frozen units and tax consequences can still restrict or affect an exit. Continuing holders need not exit. This is not an all-HDFC-funds redemption restriction.',
  },
  {
    slug: 'tata-neu-hdfc-manual-neucoins-claims-november-2026',
    title: 'Tata Neu HDFC: claim NeuCoins manually from 25 November',
    summary: 'A new claim step replaces automatic transfer for statements from 25 November 2026; unclaimed rewards can expire.',
    category: 'Credit cards', checkedAt: '2026-10-24', eventDate: '2026-11-25', dateLabel: 'Claim process effective',
    source: 'https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/pdfs/TataNeuCC_neucoins_Claim.pdf', sourceLabel: 'HDFC Bank: Tata NeuCoins claim and redemption process', sourceLocation: 'Updated 21 October 2026; pages 1–3',
    cardIds: ['tata-neu-infinity-hdfc'],
    audience: 'Primary holders of Tata Neu HDFC Bank credit cards.',
    facts: ['Statements before 25 November retain the existing automatic-transfer process. From that date, primary holders must claim spend-earned NeuCoins through the Tata Neu app.', 'Claimable rewards update within seven working days of the statement; credit after claiming can take another seven working days.', 'The stated minimum is 100 NeuCoins, with up to three successful daily claims. Unclaimed rewards expire after the claim window.'],
    actions: ['Use your bank-registered mobile number, open NeuCard and choose Claim NeuCoins.', 'Check expiry warnings on each statement. The usual claim window is 12 months from the statement; a billing-cycle change can move the deadline.'],
    limits: 'Claiming and using credited rewards have separate validity rules. Welcome/promotional rewards keep their own terms. This is an HDFC notice; it does not establish a matching SBI change or a lower earning rate.',
  },
  {
    slug: 'sbm-zet-late-fee-october-2026',
    title: 'SBM ZET: late-payment fee becomes balance-linked',
    summary: 'From 23 October 2026, the published fee is 5% of outstanding, with a ₹50 minimum and ₹1,000 maximum, before applicable GST.',
    category: 'Credit cards', checkedAt: '2026-10-24', eventDate: '2026-10-23', dateLabel: 'Fee change effective',
    source: 'https://www.sbm.bank.in/pdf/terms-conditions/SBM-Secured-Credit-Card-T&C.pdf', sourceLabel: 'SBM Bank: Secured Credit Card MITC', sourceLocation: 'Page 9, Table 08; cancellation charge on page 6',
    audience: 'SBM ZET secured credit-card holders.',
    facts: ['The late-fee table changes ZET from a flat ₹299 to 5% of outstanding, bounded by ₹50 and ₹1,000, effective 23 October 2026. GST applies.', 'The cancellation-fee condition also extends: ₹499 if cancelled within two years of activation, replacing the one-year condition.'],
    actions: ['Use your statement’s payment due date and minimum due to avoid a late fee; paying only the minimum can still incur interest.', 'Before closing a recently activated card, ask the bank to confirm the applicable cancellation charge.'],
    limits: 'The percentage can produce a lower or higher fee than ₹299 depending on outstanding. This is a ZET-specific notice, not a uniform revision to every SBM co-brand.',
  },
]

export function watchStatus(item: WatchItem): 'Upcoming at check' | 'Effective at check' {
  return item.eventDate > item.checkedAt ? 'Upcoming at check' : 'Effective at check'
}
