/** Shared information architecture for the header, section navigation, directory and footer. */
export type SiteLink = { href: string; label: string; description: string }
export type SiteSection = { id: string; label: string; href: string; description: string; prefixes: string[]; links: SiteLink[] }

export const siteSections: SiteSection[] = [
  { id: 'markets', label: 'Markets', href: '/markets', description: 'Market context and company research.', prefixes: ['/markets', '/stocks'], links: [
    { href: '/markets', label: 'Market overview', description: 'Indices, market pulse and market context.' },
    { href: '/stocks/search', label: 'Find a stock', description: 'Search companies and open their research workspace.' },
  ] },
  { id: 'research', label: 'Research', href: '/research', description: 'Publications, frameworks and research updates.', prefixes: ['/research', '/reports', '/updates', '/methodology'], links: [
    { href: '/research', label: 'Research desk', description: 'Explore the research disciplines and frameworks.' },
    { href: '/research/watch', label: 'Research Watch', description: 'Read verified consumer changes and action dates.' },
    { href: '/reports', label: 'Research reports', description: 'Read published reports and their source context.' },
    { href: '/updates/2026-10', label: 'October research bulletin', description: 'See the dated October 2026 research updates.' },
    { href: '/methodology', label: 'Methodology', description: 'Understand sources, assumptions and limitations.' },
    { href: '/research/card-scoring', label: 'Card scoring framework', description: 'Inspect the credit-card evaluation approach.' },
    { href: '/research/credit-card-data-standard', label: 'Card data standard', description: 'Review the rules for source-backed card records.' },
  ] },
  { id: 'ipo', label: 'IPOs', href: '/ipo', description: 'Track public issues from filings to listing.', prefixes: ['/ipo'], links: [
    { href: '/ipo', label: 'IPO overview', description: 'Browse the public-issue dashboard.' },
    { href: '/ipo/current', label: 'Open IPOs', description: 'Review issues currently open for subscription.' },
    { href: '/ipo/upcoming', label: 'Upcoming IPOs', description: 'Explore upcoming issues and available details.' },
    { href: '/ipo/calendar', label: 'IPO calendar', description: 'Review issue dates in calendar order.' },
    { href: '/ipo/mainboard', label: 'Mainboard IPOs', description: 'Browse mainboard issue research.' },
    { href: '/ipo/sme', label: 'SME IPOs', description: 'Browse SME issue research.' },
    { href: '/ipo/subscription', label: 'Subscription data', description: 'Inspect available subscription figures.' },
    { href: '/ipo/documents', label: 'Filings & documents', description: 'Find offer documents and source records.' },
    { href: '/ipo/analyzer', label: 'IPO analyzer', description: 'Study issue economics with visible inputs.' },
    { href: '/ipo/methodology', label: 'IPO methodology', description: 'Read the issue-research framework.' },
  ] },
  { id: 'funds', label: 'Mutual Funds', href: '/mutual-funds', description: 'Understand disclosed portfolios and holding changes.', prefixes: ['/mutual-funds', '/tools/mf-portfolio-tracker'], links: [
    { href: '/mutual-funds', label: 'Mutual fund overview', description: 'Start with the portfolio-research workflow.' },
    { href: '/tools/mf-portfolio-tracker', label: 'Portfolio intelligence', description: 'Inspect scheme holdings and compare disclosure periods.' },
  ] },
  { id: 'cards', label: 'Cards', href: '/cards', description: 'Compare cards using your spending and issuer terms.', prefixes: ['/cards'], links: [
    { href: '/cards', label: 'Card overview', description: 'Choose the right starting point for your card decision.' },
    { href: '/cards/all', label: 'Card directory', description: 'Search normalized cards by issuer, category and fee.' },
    { href: '/cards/compare', label: 'Compare cards', description: 'Compare up to three cards on a shared profile.' },
    { href: '/cards/wallet', label: 'My card wallet', description: 'Compare the cards saved on this device.' },
    { href: '/cards/cashback', label: 'Cashback cards', description: 'Rank modeled value after caps and annual fees.' },
    { href: '/cards/fuel', label: 'Fuel cards', description: 'Compare rewards and surcharge-waiver economics.' },
    { href: '/cards/upi', label: 'UPI / RuPay cards', description: 'Compare eligible merchant UPI spending.' },
    { href: '/cards/coverage', label: 'Data coverage', description: 'Check which issuers and terms are normalized.' },
    { href: '/cards/analyzer', label: 'Custom card analyzer', description: 'Model your own card terms and spend profile.' },
  ] },
  { id: 'tools', label: 'Tools', href: '/tools', description: 'Focused calculators with transparent assumptions.', prefixes: ['/tools'], links: [
    { href: '/tools', label: 'All tools', description: 'Choose a calculator for your question.' },
    { href: '/tools/credit-card-finder', label: 'Card finder', description: 'Explore card fit from entered preferences.' },
    { href: '/tools/cashback-calculator', label: 'Cashback calculator', description: 'Estimate cashback after caps and ownership costs.' },
    { href: '/tools/fuel-card-optimizer', label: 'Fuel optimizer', description: 'Model reward and surcharge-waiver value.' },
    { href: '/tools/annual-fee-break-even', label: 'Annual fee break-even', description: 'Estimate spending needed to recover a card fee.' },
    { href: '/tools/cashback-cap', label: 'Cashback cap', description: 'See how a monthly cap affects your return.' },
    { href: '/tools/fuel-surcharge-waiver', label: 'Fuel surcharge waiver', description: 'Estimate the effect of a waiver ceiling.' },
    { href: '/tools/reward-point-value', label: 'Reward point value', description: 'Convert points using your redemption value.' },
  ] },
  { id: 'workspace', label: 'My Workspace', href: '/watchlist', description: 'Your watchlists, alerts and account.', prefixes: ['/watchlist', '/alerts', '/account'], links: [
    { href: '/watchlist', label: 'Watchlist', description: 'Return to your saved market workspace.' },
    { href: '/alerts', label: 'Alerts', description: 'Review and manage your alert rules.' },
    { href: '/account', label: 'Account', description: 'Manage sign-in and account access.' },
  ] },
  { id: 'company', label: 'About & Trust', href: '/about', description: 'Who we are, how we work and how to reach us.', prefixes: ['/about', '/official', '/contact', '/disclosures', '/corrections', '/privacy', '/terms', '/refund-and-cancellation-policy', '/shipping-and-delivery-policy', '/grievance-redressal'], links: [
    { href: '/about', label: 'About CredoNomics', description: 'Learn about the platform and its purpose.' },
    { href: '/official', label: 'Official identity', description: 'Check the official website and channels.' },
    { href: '/contact', label: 'Contact', description: 'Find the published contact options.' },
    { href: '/corrections', label: 'Corrections', description: 'Report an error and review the correction process.' },
    { href: '/disclosures', label: 'Disclosures', description: 'Read important platform disclosures.' },
    { href: '/privacy', label: 'Privacy', description: 'Understand data handling and privacy.' },
    { href: '/terms', label: 'Terms', description: 'Read the conditions for using the platform.' },
    { href: '/refund-and-cancellation-policy', label: 'Refund & cancellation', description: 'Read refund eligibility, payment issue handling and cancellation conditions.' },
    { href: '/shipping-and-delivery-policy', label: 'Shipping & delivery', description: 'Understand digital content access and the no-physical-shipping policy.' },
    { href: '/grievance-redressal', label: 'Customer grievances', description: 'Find payment and customer complaint support and escalation details.' },
  ] },
]

export const primarySections = siteSections.slice(0, 6)
const matchesPath = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`)

export function sectionForPath(pathname: string): SiteSection | undefined {
  // The tracker belongs to Mutual Funds, even though its existing URL starts with /tools.
  return siteSections.flatMap(section => section.prefixes.map(prefix => ({ section, prefix })))
    .filter(({ prefix }) => matchesPath(pathname, prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0]?.section
}

export function activeSectionLink(pathname: string, section: SiteSection): string | undefined {
  return section.links.filter(link => matchesPath(pathname, link.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href
}
