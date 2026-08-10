import { CreditCard, Database } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { categoriesForCard, categoryLabel } from '../../data/card-intelligence'
import { verifiedRealCards } from '../../data/verified-real-cards'
import styles from '../../core-v4.module.css'
import local from '../cards.module.css'
import CardDirectory from './CardDirectory'

export const metadata = {
  title: 'All Verified Credit Cards',
  description:
    'Browse all real Indian credit cards currently normalized in the CredoNomics verified comparison database.',
  alternates: { canonical: '/cards/all' },
}

export default function AllCardsPage() {
  const cards = verifiedRealCards
    .slice()
    .sort((a, b) => a.issuer.localeCompare(b.issuer) || a.name.localeCompare(b.name))
    .map((card) => ({
      ...card,
      categories: categoriesForCard(card).map((slug) => ({ slug, label: categoryLabel(slug) })),
    }))

  const issuers = [...new Set(cards.map((card) => card.issuer))].sort()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CredoNomics Verified Credit Card Directory',
    numberOfItems: cards.length,
    itemListElement: cards.map((card, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: card.name,
      url: `https://www.credonomics.in/cards/${card.id}`,
    })),
  }

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>All cards</span></div>
        <span className={styles.pageKicker}><CreditCard size={14}/> Verified card directory</span>
        <h1>Browse every normalized <span>credit card.</span></h1>
        <p className={styles.pageHeroLead}>
          This directory contains the real-card records currently ready for CredoNomics rankings.
          It grows only as official-source terms are normalized and reviewed.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.statGrid}>
          <article><Database size={19}/><small>Normalized cards</small><strong>{cards.length}</strong><p>Current source-linked records.</p></article>
          <article><CreditCard size={19}/><small>Issuers represented</small><strong>{issuers.length}</strong><p>Issuers with at least one normalized card.</p></article>
          <article><Database size={19}/><small>Directory policy</small><strong>Verified</strong><p>Automated discovery records do not enter this directory directly.</p></article>
        </div>

        <div style={{ marginTop: 18 }}>
          <CardDirectory cards={cards} issuers={issuers}/>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </section>
    </SiteFrame>
  )
}
