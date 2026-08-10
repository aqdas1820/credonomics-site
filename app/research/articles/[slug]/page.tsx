import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CalendarCheck, CheckCircle2, Clock3, Mail, ShieldCheck } from 'lucide-react'
import SiteFrame from '../../../components/SiteFrame'
import { getResearchArticle, researchArticles } from '../../../data/research-articles'
import styles from '../../../core-v4.module.css'

export function generateStaticParams() {
  return researchArticles.map((article) => ({ slug: article.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getResearchArticle(params.slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/research/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      publishedTime: article.published,
      modifiedTime: article.reviewed,
      url: `https://www.credonomics.in/research/articles/${article.slug}`,
    },
  }
}

export default function ResearchArticlePage({ params }: { params: { slug: string } }) {
  const article = getResearchArticle(params.slug)
  if (!article) notFound()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.published,
    dateModified: article.reviewed,
    author: {
      '@type': 'Organization',
      name: 'CredoNomics Investment Solutions',
      url: 'https://www.credonomics.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CredoNomics Investment Solutions',
      url: 'https://www.credonomics.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.credonomics.in/credonomics-mark.png',
      },
    },
    mainEntityOfPage: `https://www.credonomics.in/research/articles/${article.slug}`,
  }

  return (
    <SiteFrame>
      <article className={`${styles.wrap} ${styles.articlePage}`}>
        <div className={styles.breadcrumbs}>
          <a href="/">Home</a><span>/</span><a href="/research">Research</a><span>/</span><span>{article.category}</span>
        </div>

        <header className={styles.articleHeader}>
          <span className={styles.pageKicker}>{article.category}</span>
          <h1>{article.title}</h1>
          <p>{article.intro}</p>
          <div className={styles.articleMeta}>
            <span><Clock3 size={15} /> {article.readTime}</span>
            <span><CalendarCheck size={15} /> Reviewed {new Date(article.reviewed + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </header>

        <div className={styles.articleLayout}>
          <aside className={styles.articleAside}>
            <b>Research standard</b>
            <p>Evergreen educational framework. Verify current issuer or bank documentation before applying it to a specific product.</p>
            <a href="/methodology">Methodology →</a>
          </aside>

          <div className={styles.articleBody}>
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && (
                  <ul>
                    {section.bullets.map((item) => <li key={item}><CheckCircle2 size={16} /> {item}</li>)}
                  </ul>
                )}
                {section.formula && <div className={styles.articleFormula}>{section.formula}</div>}
              </section>
            ))}

            <div className={styles.articleCorrection}>
              <ShieldCheck size={21} />
              <div>
                <h2>Found a rule that needs clarification?</h2>
                <p>Financial-product mechanics change. Send the current official document or source and CredoNomics can review the research framework.</p>
                <a href={`mailto:hello@credonomics.in?subject=${encodeURIComponent('CredoNomics research correction: ' + article.title)}`}>
                  Report a correction <Mail size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </article>
    </SiteFrame>
  )
}
