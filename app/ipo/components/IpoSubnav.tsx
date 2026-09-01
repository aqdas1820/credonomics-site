import { ChevronDown } from 'lucide-react'
import styles from '../ipo.module.css'

const primary = [
  { href: '/ipo/current', label: 'Open' },
  { href: '/ipo/upcoming', label: 'Upcoming' },
  { href: '/ipo?view=closed', label: 'Recently Closed' },
  { href: '/ipo?view=listed', label: 'Listed' },
]

const secondary = [
  { href: '/ipo/mainboard', label: 'Mainboard' },
  { href: '/ipo/sme', label: 'SME' },
  { href: '/ipo', label: 'All' },
]

const tools = [
  { href: '/ipo/calendar', label: 'Calendar' },
  { href: '/ipo/subscription', label: 'Subscription' },
  { href: '/ipo/documents', label: 'Documents' },
  { href: '/ipo/analyzer', label: 'Analyzer' },
  { href: '/ipo/documents', label: 'Filed / RHP pipeline' },
]

export default function IpoSubnav({ active = 'All' }: { active?: string }) {
  return (
    <nav className={styles.ipoSubnav} aria-label="IPO Intelligence navigation">
      <div className={styles.ipoSubnavInner}>
        <div className={styles.ipoPrimaryLinks}>
          {primary.map((item) => (
            <a href={item.href} key={item.href} data-active={active === item.label}>{item.label}</a>
          ))}
        </div>
        <div className={styles.ipoSecondaryLinks}>
          {secondary.map((item) => (
            <a href={item.href} key={item.href} data-active={active === item.label}>{item.label}</a>
          ))}
          <details className={styles.ipoMore}>
            <summary>More / Research Tools <ChevronDown size={13}/></summary>
            <div>
              {tools.map((item) => <a href={item.href} key={`${item.href}-${item.label}`}>{item.label}</a>)}
            </div>
          </details>
        </div>
      </div>
    </nav>
  )
}
