import { notFound } from 'next/navigation'
import { CalendarCheck, ExternalLink, ShieldCheck } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { verifiedCards } from '../../data/card-database'
import styles from '../../core-v4.module.css'
import local from '../cards.module.css'

export function generateStaticParams() {
  return verifiedCards.map((card) => ({ slug: card.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const card = verifiedCards.find((item) => item.slug === params.slug)
  if (!card) return {}
  return {
    title: `${card.productName} — ${card.issuer}`,
    description: `Source-backed CredoNomics research record for ${card.productName}.`,
    alternates: { canonical: `/cards/${card.slug}` },
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const card = verifiedCards.find((item) => item.slug === params.slug)
  if (!card) notFound()

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/cards">Cards</a><span>/</span><span>{card.productName}</span></div>
        <span className={styles.pageKicker}>{card.issuer}</span>
        <h1>{card.productName}</h1>
        <p className={styles.pageHeroLead}>A structured CredoNomics research record with official-source references and transparent assumptions.</p>
        <div className={styles.researchReviewStamp}><CalendarCheck size={14}/> Product terms verified {card.lastVerified}</div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.statGrid}>
          <article><small>Annual fee</small><strong>₹{card.annualFeeRupees.toLocaleString('en-IN')}</strong><p>Before applicable tax.</p></article>
          <article><small>Base reward rate</small><strong>{card.baseRewardRatePercent}%</strong><p>Subject to documented exclusions and redemption mechanics.</p></article>
          <article><small>Verification</small><strong>{card.officialSources.length}</strong><p>Official source record(s) attached.</p></article>
        </div>

        <section className={local.registry}>
          <div className={local.registryHead}><div><span>Official sources</span><h2>Documents used for this record.</h2></div></div>
          <div className={local.cardRegistry}>
            {card.officialSources.map((source) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                <small>Checked {source.checkedAt}</small><h3>{source.label}</h3><span>Open source <ExternalLink size={12}/></span>
              </a>
            ))}
          </div>
        </section>

        <div className={local.trustNote}><ShieldCheck size={20}/><p>Always confirm the issuer’s current terms before applying. Product records can become stale after a bank revises fees, rewards, caps or eligibility.</p></div>
      </section>
    </SiteFrame>
  )
}
