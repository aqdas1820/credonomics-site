import { Gauge, ShieldCheck } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import styles from '../../core-v4.module.css'
import local from '../../cards/cards.module.css'

export const metadata = {
  title: 'CredoNomics Card Fit Score Methodology',
  description: 'How the CredoNomics custom card analyzer builds its transparent 100-point Fit Score.',
  alternates: { canonical: '/research/card-scoring' },
}

const rows = [
  ['Reward potential', '40', 'Gross modeled reward rate, scaled against a visible 5% benchmark.'],
  ['Fee efficiency', '20', 'How much modeled reward value remains after annual fee and applicable fee tax.'],
  ['Cap efficiency', '15', 'How much theoretical reward survives the monthly caps entered into the model.'],
  ['Base-rate resilience', '15', 'Base reward rate, scaled against a visible 1.5% benchmark.'],
  ['Spend fit', '10', 'Share of the user’s spending that lands in categories earning above the card’s base rate.'],
]

export default function Page() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/research">Research</a><span>/</span><span>Card scoring</span></div>
        <span className={styles.pageKicker}><Gauge size={14}/> Transparent scoring</span>
        <h1>A score should be <span>inspectable.</span></h1>
        <p className={styles.pageHeroLead}>
          The CredoNomics Fit Score is a decision heuristic built from the values entered into the custom analyzer.
          It is not a credit score and it does not claim to measure every benefit a credit card can offer.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.featureGrid}>
          {rows.map(([title, points, description], index) => (
            <article key={title}><span>0{index + 1} / {points} points</span><h2>{title}</h2><p>{description}</p></article>
          ))}
        </div>

        <div className={local.trustNote} style={{marginTop: 16}}>
          <ShieldCheck size={20}/>
          <p>
            The score deliberately excludes subjective valuations for lounge access, memberships, milestone gifts and
            lifestyle benefits unless those are separately converted into a realistic personal rupee value.
          </p>
        </div>
      </section>
    </SiteFrame>
  )
}
