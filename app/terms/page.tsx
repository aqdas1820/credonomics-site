import { ExternalLink, FileWarning, Scale, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for CredoNomics financial research and calculators.',
}

export default function TermsPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Terms</span></div>
        <span className={styles.pageKicker}><Scale size={14}/> Terms of use</span>
        <h1>Use the tools as research aids, <span>not guarantees.</span></h1>
        <p className={styles.pageHeroLead}>By using CredoNomics, you acknowledge that financial-product terms and real-world outcomes can differ from modeled examples.</p>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.policyGrid}>
          <article className={styles.policyCard}><span><ShieldCheck size={20}/></span><h2>Informational use</h2><p>Content is provided for general information, education and comparison. It is not personalized financial, investment, legal, tax or accounting advice.</p></article>
          <article className={styles.policyCard}><span><FileWarning size={20}/></span><h2>Accuracy and changes</h2><p>Reasonable efforts may be made to improve accuracy, but product providers can change terms without notice. CredoNomics may correct, update or remove content at any time.</p></article>
          <article className={styles.policyCard}><span><ExternalLink size={20}/></span><h2>Third-party sources</h2><p>External sites and documents are controlled by their respective owners. A link or reference does not imply endorsement, control or a guarantee of continued availability.</p></article>
          <article className={styles.policyCard}><span><Scale size={20}/></span><h2>User responsibility</h2><p>You are responsible for verifying current terms, determining suitability for your situation and obtaining professional advice where appropriate before acting.</p></article>
        </div>
      </section>
    </SiteFrame>
  )
}
