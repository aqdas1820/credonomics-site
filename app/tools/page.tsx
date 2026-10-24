import { ArrowUpRight, Calculator, CreditCard, Database, Landmark } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { publicTools } from '../data/tool-registry'
import { quickCalculators } from '../data/quick-calculators'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Financial Research & Decision Tools',
  description: 'Choose a research workspace, compare source-linked cards or model a financial rule with a focused CredoNomics calculator.',
  alternates: { canonical: '/tools' },
}

const groups = [
  { id: 'research-workspaces', title: 'Research workspaces', description: 'Open the full research application when you need holdings or issue-level analysis.', items: [
    { href: '/tools/mf-portfolio-tracker', title: 'Mutual Fund Portfolio Intelligence', description: 'Inspect scheme holdings and compare disclosed portfolio periods.', kind: 'Disclosed portfolio data', icon: Database },
    { href: '/ipo/analyzer', title: 'IPO Analyzer', description: 'Study issue economics, financial quality and valuation inputs.', kind: 'Issue research', icon: Landmark },
  ] },
  { id: 'card-decisions', title: 'Compare real cards', description: 'These workspaces use the normalized issuer dataset. Open the card research to check merchant conditions and verification dates.', items: [
    { href: '/cards/compare', title: 'Card comparison', description: 'Compare up to three normalized cards with the same spending profile.', kind: 'Source-linked card terms', icon: CreditCard },
    { href: '/cards/wallet', title: 'My Card Wallet', description: 'Save card names on this device and compare category value.', kind: 'Browser-saved wallet', icon: CreditCard },
    { href: '/cards', title: 'Find cards by need', description: 'Choose a category such as cashback, fuel, UPI or travel.', kind: 'Card discovery', icon: CreditCard },
  ] },
  { id: 'custom-models', title: 'Build your own scenario', description: 'Enter and check the assumptions yourself. These custom models do not verify your entered card terms.', items: [
    ...publicTools.map(tool => ({ href: tool.href, title: tool.title, description: tool.description, kind: 'Custom inputs', icon: tool.icon })),
    { href: '/cards/analyzer', title: 'Custom Card Analyzer', description: 'Model category spending, reward caps, fees and reward leakage.', kind: 'Custom inputs', icon: CreditCard },
  ] },
  { id: 'focused-calculators', title: 'Focused calculators', description: 'Answer one specific question with a smaller set of inputs.', items: quickCalculators.map(tool => ({ href: `/tools/${tool.slug}`, title: tool.title, description: tool.description, kind: 'Single-rule calculation', icon: Calculator })) },
]

export default function ToolsPage() {
  return <SiteFrame>
    <section className={`${styles.wrap} ${styles.pageHero}`}>
      <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Tools</span></div>
      <span className={styles.pageKicker}>RESEARCH & DECISION TOOLS</span>
      <h1>The right tool for <span>the question in front of you.</span></h1>
      <p className={styles.pageHeroLead}>Choose between a research workspace, a source-linked comparison and a custom calculator. Each tool keeps its inputs and assumptions visible.</p>
      <nav aria-label="Tool collections" style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:24}}>{groups.map(group => <a className={styles.secondaryButton} href={`#${group.id}`} key={group.id}>{group.title}</a>)}</nav>
    </section>
    <div className={`${styles.wrap} ${styles.pageBody}`}>
      {groups.map(group => <section id={group.id} key={group.id} className={styles.researchArticleSection} style={{scrollMarginTop:100}}>
        <div className={styles.sectionHead}><h2>{group.title}</h2><p>{group.description}</p></div>
        <div className={styles.toolGrid}>{group.items.map(tool => {
          const Icon = tool.icon
          return <a className={styles.toolCard} href={tool.href} key={tool.href}>
            <div className={styles.cardTop}><span className={styles.iconTile}><Icon size={22} aria-hidden="true"/></span><span className={styles.cardLabel}>{tool.kind}</span></div>
            <h3>{tool.title}</h3><p>{tool.description}</p><div className={styles.cardFooter}><span>Open tool</span><ArrowUpRight size={16} aria-hidden="true"/></div>
          </a>
        })}</div>
      </section>)}
      <div className={styles.notice}><div><h2>Understand the model before using the result.</h2><p>Results depend on entered inputs, available source terms and the applicable period. <a href="/methodology">Read the methodology</a> or <a href="/corrections">report an error</a>.</p></div></div>
    </div>
  </SiteFrame>
}
