import Link from 'next/link'
import { CloudDownload, PackageX, CreditCard, Mail, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'CredoNomics Investment Solutions digital content availability, shipping exclusions and any future paid digital service delivery.',
  alternates: { canonical: '/shipping-and-delivery-policy' },
}

export default function ShippingAndDeliveryPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><Link href="/">Home</Link><span>/</span><span>Shipping &amp; Delivery</span></div>
        <span className={styles.pageKicker}><CloudDownload size={14}/> Digital services</span>
        <h1>Online information, <span>not physical shipping.</span></h1>
        <p className={styles.pageHeroLead}>Our current website provides digital educational content, research and decision tools. This page explains how the content is delivered and why shipping does not apply.</p>
        <p>Last updated: 1 November 2026</p>
      </section>
      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}><span><CloudDownload size={20}/></span><h2>Availability of free digital content</h2><p>Public articles, comparisons and calculators are accessed directly online through the website, generally as soon as the relevant page or tool loads. Availability may be affected by maintenance, connectivity, authentication or data-provider delays. No physical shipment or courier is required.</p></article>
          <article className={styles.policyCard}><span><PackageX size={20}/></span><h2>No physical products or cash on delivery</h2><p>CredoNomics does not currently sell or dispatch physical goods through this website. There are therefore no shipping charges, physical delivery addresses to provide for these services or cash-on-delivery orders.</p></article>
          <article className={styles.policyCard}><span><CreditCard size={20}/></span><h2>Voluntary contributions</h2><p>Where payment collection is enabled, optional one-time contributions support site development. They do not create an order for a physical item or a promise of any individual digital deliverable. The amount and payment confirmation process are shown in the contribution flow. Online contributions may remain unavailable until verified collection is activated.</p></article>
          <article className={styles.policyCard}><span><ShieldCheck size={20}/></span><h2>If paid digital services are introduced</h2><p>Any future paid digital offering will show its price, scope, access or delivery mechanism and estimated fulfilment time before a user pays. These details cannot be inferred from the present free services or voluntary support options.</p></article>
        </div>
        <div className={styles.notice}>
          <Mail size={22}/>
          <div><h2>Questions about access or fulfilment?</h2><p>Contact <a href="mailto:support@credonomics.in">support@credonomics.in</a> with the page or transaction reference (if any). See our <Link href="/terms">Terms</Link> and <Link href="/refund-and-cancellation-policy">Refund &amp; Cancellation Policy</Link>.</p></div>
        </div>
      </section>
    </SiteFrame>
  )
}
