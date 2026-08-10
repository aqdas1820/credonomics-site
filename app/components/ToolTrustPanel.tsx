import { AlertTriangle, CalendarCheck, CheckCircle2, ExternalLink, FileSearch, Mail } from 'lucide-react'
import { PUBLIC_REVIEW_DATE, publicTools } from '../data/tool-registry'
import ToolUtilities from './ToolUtilities'
import styles from './tool-trust.module.css'

export default function ToolTrustPanel({ slug }: { slug: string }) {
  const tool = publicTools.find((item) => item.slug === slug)

  if (!tool) return null

  return (
    <section className={styles.shell} aria-label={`${tool.title} methodology`}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div>
            <span className={styles.kicker}><FileSearch size={14} /> CredoNomics analysis standard</span>
            <h2>Know what sits behind the result.</h2>
            <p>
              The calculator is a decision aid, not a guarantee of eligibility or benefits.
              Current issuer or bank documentation should be checked before acting on the result.
            </p>
          </div>
          <div className={styles.reviewStamp}>
            <CalendarCheck size={18} />
            <span><small>Framework reviewed</small><b>{PUBLIC_REVIEW_DATE}</b></span>
          </div>
        </div>

        <div className={styles.methodGrid}>
          {tool.methodology.map((item, index) => (
            <div key={item}>
              <span className={styles.step}>0{index + 1}</span>
              <p><CheckCircle2 size={15} /> {item}</p>
            </div>
          ))}
        </div>

        <div className={styles.warning}>
          <AlertTriangle size={18} />
          <div>
            <b>Product terms are not marked “verified” by this date.</b>
            <p>
              The date above applies to the CredoNomics calculation framework. Product fees,
              reward rules, merchant classification and eligibility can change independently.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <ToolUtilities />
          <div className={styles.links}>
            <a href="/methodology">Read methodology <ExternalLink size={14} /></a>
            <a href="mailto:hello@credonomics.in?subject=CredoNomics%20correction%20request">
              Report a correction <Mail size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
