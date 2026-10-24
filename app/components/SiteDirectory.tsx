'use client'

import { useState } from 'react'
import { siteSections } from '../data/site-navigation'
import styles from './site-directory.module.css'

export default function SiteDirectory() {
  const [query, setQuery] = useState('')
  const [sectionId, setSectionId] = useState('all')
  const normalized = query.trim().toLowerCase()
  const sections = siteSections.filter(section => sectionId === 'all' || section.id === sectionId).map(section => ({
    ...section,
    links: section.links.filter(link => `${section.label} ${link.label} ${link.description}`.toLowerCase().includes(normalized)),
  })).filter(section => section.links.length)
  const count = sections.reduce((total, section) => total + section.links.length, 0)
  return <section className={styles.directory} aria-labelledby="directory-heading">
    <div className={styles.heading}><span>PLATFORM DIRECTORY</span><h2 id="directory-heading">Everything has a place.</h2><p>Choose a section or search for the task you want to complete.</p></div>
    <div className={styles.controls}>
      <label>Find a page or task<input type="search" placeholder="Try portfolio, card fees or IPO calendar" value={query} onChange={event => setQuery(event.target.value)}/></label>
      <label>Section<select value={sectionId} onChange={event => setSectionId(event.target.value)}><option value="all">All sections</option>{siteSections.map(section => <option key={section.id} value={section.id}>{section.label}</option>)}</select></label>
      <button type="button" disabled={!query && sectionId === 'all'} onClick={() => { setQuery(''); setSectionId('all') }}>Reset</button>
    </div>
    <p role="status" className={styles.count}>{count} destinations across {sections.length} sections</p>
    {count === 0 && <div className={styles.empty}><h3>No matching pages</h3><p>Try a broader term or reset the filters.</p><button type="button" onClick={() => { setQuery(''); setSectionId('all') }}>Show all sections</button></div>}
    <div className={styles.grid}>{sections.map(section => <article key={section.id} className={styles.section}>
      <div className={styles.sectionHead}><span>{section.label}</span><small>{section.links.length} destinations</small></div>
      <p>{section.description}</p>
      <ul>{section.links.map(link => <li key={link.href}><a href={link.href}><b>{link.label}<span aria-hidden="true">↗</span></b><small>{link.description}</small></a></li>)}</ul>
    </article>)}</div>
  </section>
}
