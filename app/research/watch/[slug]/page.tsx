import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SiteFrame from '../../../components/SiteFrame'
import { researchWatch, watchStatus } from '../../../data/research-watch'
import styles from '../../../core-v4.module.css'
import local from '../../../components/research-watch.module.css'
export function generateStaticParams() { return researchWatch.map(item => ({ slug: item.slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = researchWatch.find(row => row.slug === slug)
  return item ? { title: item.title, description: item.summary, alternates: { canonical: `/research/watch/${item.slug}` } } : {}
}
export default async function WatchArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = researchWatch.find(row => row.slug === slug)
  if (!item) notFound()
  const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: item.title, datePublished: `${item.publishedAt ?? item.checkedAt}T00:00:00+05:30`, dateModified: `${item.checkedAt}T00:00:00+05:30`, author: { '@type': 'Organization', name: 'CredoNomics Research Desk' }, citation: item.source, mainEntityOfPage: `https://www.credonomics.in/research/watch/${item.slug}` }
  return <SiteFrame>
    <section className={`${styles.wrap} ${styles.pageHero}`}><div className={styles.breadcrumbs}><a href="/">Home</a><span>/</span><a href="/research/watch">Research Watch</a><span>/</span><span>{item.category}</span></div><span className={styles.pageKicker}>SOURCE-CHECKED CONSUMER UPDATE</span><h1>{item.title}</h1><p className={styles.pageHeroLead}>{item.summary}</p><div className={local.meta}><span>Published {item.publishedAt ?? item.checkedAt}</span><span>Checked {item.checkedAt}</span><span>{watchStatus(item)}</span>{item.announcementDate && <span>Notice dated {item.announcementDate}</span>}<span>{item.dateLabel}: {item.eventDate}</span></div></section>
    <div className={`${styles.wrap} ${styles.pageBody}`}><article className={local.article}>
      {item.updateNote && <p><strong>Guide update:</strong> {item.updateNote}</p>}
      <h2>Who should read this?</h2><p>{item.audience}</p><h2>What the official notice says</h2><ul>{item.facts.map(fact => <li key={fact}>{fact}</li>)}</ul>
      <h2>Your next steps</h2><ol>{item.actions.map(action => <li key={action}>{action}</li>)}</ol><div className={local.limit}><h2>Scope and limitations</h2><p>{item.limits}</p></div>
      <a className={local.source} href={item.source} target="_blank" rel="noreferrer">Read the original notice: {item.sourceLabel} ↗<small>Evidence location: {item.sourceLocation}. Checked {item.checkedAt}. Action steps are CredoNomics editorial guidance based on the linked notice.</small></a>
      {item.additionalSources && <div><h2>Supporting primary sources</h2><ul>{item.additionalSources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></li>)}</ul></div>}
      <p><a href="/research/watch">← All Research Watch guides</a> · <a href="/updates/2026-10">October bulletin</a> · <a href="/corrections">Report a correction</a></p>
    </article></div><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
  </SiteFrame>
}
