import { ExternalLink, Globe2, Instagram, Mail, Phone, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { organizationId, siteIdentity } from '../data/site-identity'
import styles from '../core-v4.module.css'
import local from './official.module.css'

export const metadata = {
  title: 'Official CredoNomics Website & Channels',
  description:
    'Verify the registered business name, sole proprietorship details, contact emails and official CredoNomics channels.',
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

        <section className={local.registeredBusiness} aria-labelledby="legal-business-identity-title">
          <div className={local.registeredBusinessHeader}>
            <ShieldCheck size={22} aria-hidden="true" />
            <div>
              <h2 id="legal-business-identity-title">Registered business &amp; legal identity</h2>
              <p>Business information for customers, payment-provider verification and official correspondence.</p>
            </div>
          </div>
          <dl className={local.registeredBusinessGrid}>
            <div><dt>Registered business / trade name</dt><dd>{siteIdentity.alternateName}</dd></div>
            <div><dt>Legal constitution</dt><dd>Sole proprietorship</dd></div>
            <div><dt>Business location</dt><dd>Dhule, Maharashtra, India</dd></div>
            <div><dt>Registered business contact email</dt><dd><a href={`mailto:${siteIdentity.registeredBusinessEmail}`}>{siteIdentity.registeredBusinessEmail}</a></dd></div>
            <div><dt>Customer and payment support</dt><dd><a href="mailto:support@credonomics.in">support@credonomics.in</a></dd></div>
            <div><dt>Principal website activity</dt><dd>Financial education, informational research, comparison tools and digital publishing</dd></div>
          </dl>
          <p className={local.registeredBusinessNote}>CredoNomics Investment Solutions is a sole-proprietor business name, not a claim of private limited company incorporation or SEBI registration. For the scope of our services and regulatory disclosures, see <a href="/disclosures">Disclosures</a>.</p>
        </section>

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
