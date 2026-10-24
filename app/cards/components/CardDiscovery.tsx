import { verifiedRealCards } from '../../data/verified-real-cards'
import styles from './card-discovery.module.css'

const pairs = [
  { label: 'Online shopping', category: 'shopping', ids: ['cashback-sbi', 'swiggy-hdfc'] },
  { label: 'Everyday utilities', category: 'utilities', ids: ['airtel-axis', 'axis-ace'] },
  { label: 'Fuel rewards', category: 'fuel', ids: ['bpcl-sbi', 'bpcl-sbi-octane'] },
  { label: 'Amazon or Flipkart?', category: 'shopping', ids: ['amazon-pay-icici', 'flipkart-axis'] },
]

export default function CardDiscovery() {
  return <section className={styles.panel} aria-labelledby="card-desk-title">
    <div className={styles.heading}><div><span>YOUR NEXT CARD DECISION</span><h2 id="card-desk-title">Start with what you need.</h2></div><a href="/cards/all">Search all cards →</a></div>
    <div className={styles.paths}>
      <a href="/cards/beginner"><small>FIRST CARD</small><h3>Start with the essentials</h3><p>Compare entry-level card economics and read the issuer conditions.</p><b>Explore first-card options →</b></a>
      <a href="/cards/cashback"><small>NEXT CARD</small><h3>Make your spending count</h3><p>Change your monthly eligible spend and see value after caps and fees.</p><b>Find my cashback fit →</b></a>
      <a href="/cards/wallet"><small>CARDS I HOLD</small><h3>Your personal card desk</h3><p>Save card names on this device and compare your wallet by category.</p><b>Open my wallet →</b></a>
    </div>
    <div className={styles.heading}><div><span>POPULAR QUESTIONS</span><h2>Two cards. One spending profile.</h2></div><a href="/cards/compare">Build any comparison →</a></div>
    <div className={styles.pairs}>{pairs.map(pair => {
      const cards = pair.ids.map(id => verifiedRealCards.find(card => card.id === id)!)
      return <a key={pair.label} href={`/cards/compare?category=${pair.category}&cards=${pair.ids.join(',')}`}><small>{pair.label}</small><h3>{cards[0].name}<span>vs</span>{cards[1].name}</h3><b>Compare modeled annual value →</b></a>
    })}</div>
    <p>Use eligible spend for each card’s stated merchant conditions. Different reward currencies and partner restrictions can change the practical result. <a href="/methodology">Read our methodology</a> · <a href="/updates/2026-10">October research updates</a></p>
  </section>
}
