import SiteFrame from '../../components/SiteFrame'
import { verifiedRealCards } from '../../data/verified-real-cards'
import WalletClient from './WalletClient'
import styles from '../../core-v4.module.css'

export const metadata = {
  title: 'My Card Wallet — Compare the Cards You Hold',
  description: 'Save your card names on this device and compare their estimated category value using source-linked issuer terms. No card numbers or signup needed.',
  alternates: { canonical: '/cards/wallet' },
}

export default function WalletPage() {
  return <SiteFrame>
    <section className={`${styles.wrap} ${styles.pageHero}`}>
      <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>My wallet</span></div>
      <span className={styles.pageKicker}>YOUR CARD DESK</span>
      <h1>Get more clarity from <span>the cards you hold.</span></h1>
      <p className={styles.pageHeroLead}>Save card names, choose a spending category and compare modeled annual value. Your wallet stays in this browser. No login or card numbers needed.</p>
    </section>
    <section className={`${styles.wrap} ${styles.pageBody}`}><WalletClient cards={verifiedRealCards}/></section>
  </SiteFrame>
}
