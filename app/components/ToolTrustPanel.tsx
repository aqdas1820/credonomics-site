import { AlertTriangle, CalendarCheck, CheckCircle2, ExternalLink, FileSearch, Mail } from 'lucide-react'
import { PUBLIC_REVIEW_DATE, publicTools } from '../data/tool-registry'
import ToolUtilities from './ToolUtilities'
import styles from './tool-trust.module.css'

export default function ToolTrustPanel({ slug }: { slug: string }) {
  const tool = publicTools.find((item) => item.slug === slug)
  if (!tool) return null
  const report=[['01','Gross benefit','Rewards, cashback or waiver before friction'],['02','Friction','Caps, exclusions, eligibility and merchant rules'],['03','Ownership cost','Annual fee, applicable taxes and other recurring cost'],['04','Net value','Decision-ready value after the modeled deductions']]
  return <section className={styles.shell} aria-label={`${tool.title} methodology`}><div className={styles.inner}><div className={styles.heading}><div><span className={styles.kicker}><FileSearch size={14}/> CredoNomics analysis report</span><h2>Read the result as a model, not a promise.</h2><p>Use the calculator output together with the assumptions, product restrictions and current official documents that govern your actual transaction.</p></div><div className={styles.reviewStamp}><CalendarCheck size={18}/><span><small>Framework reviewed</small><b>{PUBLIC_REVIEW_DATE}</b></span></div></div><div className={styles.methodGrid}>{report.map(([no,title,text])=><div key={no}><span className={styles.step}>{no}</span><p><CheckCircle2 size={15}/><span><b>{title}</b><br/>{text}</span></p></div>)}</div><div className={styles.warning}><AlertTriangle size={18}/><div><b>Product-specific terms are not certified by the framework-review date.</b><p>Fees, caps, exclusions, merchant classification, eligibility and issuer interpretation can change. Verify the current official source before acting.</p></div></div><div className={styles.actions}><ToolUtilities/><div className={styles.links}><a href="/methodology">Methodology <ExternalLink size={14}/></a><a href="/corrections">Corrections <Mail size={14}/></a></div></div></div></section>
}
