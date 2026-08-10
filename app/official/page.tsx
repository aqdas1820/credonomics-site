import { ExternalLink, Globe2, Instagram, Mail, Phone, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { organizationId, siteIdentity } from '../data/site-identity'
import styles from '../core-v4.module.css'
import local from './official.module.css'

export const metadata = {
  title: 'Official CredoNomics Website & Channels',
  description:
    'Verify the official CredoNomics website, email, Instagram account and contact information.',
  alternates: { canonical: '/official' },
}

export default function OfficialPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${siteIdentity.canonicalUrl}/official#page`,
    url: `${siteIdentity.canonicalUrl}/official`,
    name: 'Official CredoNomics Website & Channels',
    about: { '@id': organizationId },
    isPartOf: { '@id': `${siteIdentity.canonicalUrl}/#website` },
  }

  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Official identity</span></div>
        <span className={styles.pageKicker}><ShieldCheck size={14}/> Verify CredoNomics</span>
        <h1>The official CredoNomics <span>web identity.</span></h1>
        <p className={styles.pageHeroLead}>
          Use this page to verify the official domain and public communication channels associated with CredoNomics.
        </p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody} ${local.shell}`}>
        <div className={local.identityCard}>
          <img src="/credonomics-mark.png" alt="CredoNomics symbol" />
          <div>
            <small>Official brand</small>
            <h2>CredoNomics</h2>
            <p>India-focused credit-card intelligence and financial decision tools.</p>
          </div>
        </div>

        <div className={local.channelGrid}>
          <a href={siteIdentity.canonicalUrl}>
            <Globe2 size={20}/><small>Official website</small><strong>www.credonomics.in</strong><span>Canonical web domain</span>
          </a>
          <a href={`mailto:${siteIdentity.email}`}>
            <Mail size={20}/><small>Official email</small><strong>{siteIdentity.email}</strong><span>Research corrections & enquiries</span>
          </a>
          <a href={siteIdentity.instagram} target="_blank" rel="noreferrer">
            <Instagram size={20}/><small>Official Instagram</small><strong>{siteIdentity.instagramHandle}</strong><span>Open profile <ExternalLink size={12}/></span>
          </a>
          <a href={`tel:${siteIdentity.phoneInternational}`}>
            <Phone size={20}/><small>Official phone</small><strong>{siteIdentity.phoneDisplay}</strong><span>General contact</span>
          </a>
        </div>

        <div className={local.disambiguation}>
          <ShieldCheck size={21}/>
          <div>
            <h2>Brand clarification</h2>
            <p>
              CredoNomics is the financial research and decision-tools brand published at
              <b> credonomics.in</b>. It is not affiliated with similarly named websites,
              domains or companies unless an affiliation is explicitly stated on this official site.
            </p>
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </section>
    </SiteFrame>
  )
}
