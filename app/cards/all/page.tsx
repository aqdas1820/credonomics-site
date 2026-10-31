import { ChevronRight, ShieldCheck } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { categoriesForCard, categoryLabel } from '../../data/card-intelligence'
import { verifiedRealCards } from '../../data/verified-real-cards'
import CardDirectory from './CardDirectory'
import styles from './review-page.module.css'

export const metadata = {
  title: 'Compare Credit Cards in India | CredoNomics Card Reviews',
  description: 'Browse source-linked Indian credit card research with clear annual fees, reward terms, lounge access and direct issuer source links.',
  alternates: { canonical: '/cards/all' },
}

export default function AllCardsPage() {
  const cards = verifiedRealCards
    .slice()
    .sort((a, b) => a.issuer.localeCompare(b.issuer) || a.name.localeCompare(b.name))
    .map(card => ({
      ...card,
      categories: categoriesForCard(card).map(slug => ({ slug, label: categoryLabel(slug) })),
    }))
  const issuers = [...new Set(cards.map(card => card.issuer))].sort()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CredoNomics Source-Linked Credit Card Review Directory',
    numberOfItems: cards.length,
    itemListElement: cards.map((card, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: card.name,
      url: 'https://www.credonomics.in/cards/' + card.id,
    })),
  }

  return <SiteFrame>
    <div className={styles.page}>
      <div className={styles.wrap}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/">Home</a><ChevronRight size={13}/><a href="/cards">Credit Cards</a><ChevronRight size={13}/><span>All Reviews</span>
        </nav>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>THE CREDONOMICS CARD GUIDE</p>
          <h1>Compare Indian Credit Cards</h1>
          <p>Independent, source-linked card research. Examine actual fees, conditions and rewards before choosing what suits your spending.</p>
          <div className={styles.standards}><span><ShieldCheck size={15}/> Verified issuer sources</span><span>{cards.length} normalized products</span><span>{issuers.length} banks &amp; issuers</span></div>
        </header>
        <CardDirectory cards={cards} issuers={issuers}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
      </div>
    </div>
  </SiteFrame>
}
