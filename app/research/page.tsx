import { ArrowUpRight, CheckCircle2, CreditCard, FileSearch, Fuel, Landmark, ShieldCheck } from 'lucide-react'
import SiteFrame from '../components/SiteFrame'
import { RESEARCH_REVIEW_DATE, researchArticles } from '../data/research-articles'
import styles from '../core-v4.module.css'

export const metadata = {
  title: 'Research Desk',
  description: 'CredoNomics research frameworks for credit-card rewards, cashback, fuel-card economics and banking product terms.',
}

export default function ResearchPage() {
  return (
    <SiteFrame>
      <section className={`${styles.wrap} ${styles.pageHero}`}>
        <div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><span>Research</span></div>
        <span className={styles.pageKicker}><FileSearch size={14}/> CredoNomics Research Desk</span>
        <h1>Research the rules before you trust the <span>headline.</span></h1>
        <p className={styles.pageHeroLead}>
          CredoNomics focuses on the product rules that materially change real-world value:
          fees, exclusions, caps, transaction ranges, eligibility and timing.
        </p>
        <div className={styles.researchReviewStamp}>Research framework reviewed {RESEARCH_REVIEW_DATE}</div>
      </section>

      <section className={`${styles.wrap} ${styles.pageBody}`}>
        <div className={styles.researchGrid}>
          <article className={styles.contentCard}>
            <span className={styles.iconTile}><CreditCard size={21}/></span>
            <h3>Credit-card reward economics</h3>
            <p>A framework for turning advertised rewards into an effective annual value.</p>
            <ul>
              <li><CheckCircle2 size={14}/> Identify eligible and excluded categories</li>
              <li><CheckCircle2 size={14}/> Apply monthly or annual reward caps</li>
              <li><CheckCircle2 size={14}/> Include annual fee and applicable taxes</li>
              <li><CheckCircle2 size={14}/> Separate fee waiver from rewards</li>
            </ul>
          </article>

          <article className={styles.contentCard}>
            <span className={styles.iconTile}><Fuel size={21}/></span>
            <h3>Fuel-card reward economics</h3>
            <p>Avoid double-counting surcharge waiver, reward points and app-specific benefits.</p>
            <ul>
              <li><CheckCircle2 size={14}/> Check eligible fuel outlets</li>
              <li><CheckCircle2 size={14}/> Check transaction range and waiver ceiling</li>
              <li><CheckCircle2 size={14}/> Convert points to realistic rupee value</li>
              <li><CheckCircle2 size={14}/> Treat promotional benefits separately</li>
            </ul>
          </article>

          <article className={styles.contentCard}>
            <span className={styles.iconTile}><Landmark size={21}/></span>
            <h3>Banking product terms</h3>
            <p>Operational conditions can decide whether a product is useful in practice.</p>
            <ul>
              <li><CheckCircle2 size={14}/> Schedule of charges</li>
              <li><CheckCircle2 size={14}/> Eligibility and account conditions</li>
              <li><CheckCircle2 size={14}/> Transaction restrictions</li>
              <li><CheckCircle2 size={14}/> Effective dates and revised terms</li>
            </ul>
          </article>
        </div>

        <section className={styles.researchArticleSection}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.overline}>Evergreen research</span>
              <h2>Practical articles built around the maths behind the product.</h2>
            </div>
            <p>These articles explain reusable frameworks rather than pretending a product’s current terms will stay unchanged forever.</p>
          </div>

          <div className={styles.articleCardGrid}>
            {researchArticles.map((article) => (
              <a className={styles.articleCard} href={`/research/articles/${article.slug}`} key={article.slug}>
                <span>{article.category}</span>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <div><small>{article.readTime}</small><ArrowUpRight size={16}/></div>
              </a>
            ))}
          </div>
        </section>

        <div className={styles.notice}>
          <ShieldCheck size={22}/>
          <div>
            <h2>Research should age visibly.</h2>
            <p>Financial-product terms change. Re-check the effective date and official source before applying an older calculation or comparison to a current decision.</p>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
