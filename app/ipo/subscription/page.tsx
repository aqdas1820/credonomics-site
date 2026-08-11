import { BarChart3, Database, ExternalLink } from 'lucide-react'
import SiteFrame from '../../components/SiteFrame'
import { verifiedIpos } from '../../data/verified-ipos.generated'
import styles from '../../core-v4.module.css'
import local from '../ipo.module.css'
import IpoSubnav from '../components/IpoSubnav'

export const metadata = {
  title: 'IPO Subscription Status',
  description: 'QIB, NII and retail IPO subscription data from normalized source-backed CredoNomics IPO records.',
  alternates: { canonical: '/ipo/subscription' },
}

function x(value?: number) {
  return value === undefined ? '—' : `${value.toLocaleString('en-IN',{maximumFractionDigits:2})}×`
}

export default function SubscriptionPage() {
  const records = verifiedIpos.filter((ipo) => ipo.subscription && (
    ipo.subscription.total !== undefined ||
    ipo.subscription.qib !== undefined ||
    ipo.subscription.nii !== undefined ||
    ipo.subscription.retail !== undefined
  ))

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero} ${local.compactHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/ipo">IPO Intelligence</a><span>/</span><span>Subscription</span></div>
        <span className={styles.pageKicker}><BarChart3 size={14}/> Separate market-demand layer</span>
        <h1>IPO Subscription</h1>
        <p className={styles.pageHeroLead}>QIB, NII and retail demand is displayed separately from the CredoNomics fundamental Data Score.</p>
      </section>

      <IpoSubnav active="Subscription"/>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        {records.length ? (
          <div className={local.subscriptionTable}>
            <div><span>IPO</span><span>QIB</span><span>sNII</span><span>bNII</span><span>Retail</span><span>Total</span><span>Updated</span></div>
            {records.map((ipo) => (
              <div key={ipo.slug}>
                <a href={`/ipo/${ipo.slug}`}><b>{ipo.companyName}</b><small>{ipo.marketSegment}</small></a>
                <strong>{x(ipo.subscription?.qib)}</strong>
                <strong>{x(ipo.subscription?.sNii)}</strong>
                <strong>{x(ipo.subscription?.bNii)}</strong>
                <strong>{x(ipo.subscription?.retail)}</strong>
                <strong>{x(ipo.subscription?.total)}</strong>
                <span>{ipo.subscription?.updatedAt || '—'} {ipo.subscription?.sourceUrl && <a href={ipo.subscription.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={11}/></a>}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={local.explorerEmpty}><Database size={27}/><div><h2>No source-backed subscription rows yet.</h2><p>Subscription multiples will appear only when a reliable source has been normalized; they will remain outside the fundamental Data Score.</p></div></div>
        )}
      </section>
    </SiteFrame>
  )
}
