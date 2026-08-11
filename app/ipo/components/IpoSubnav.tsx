import {
  BarChart3,
  CalendarDays,
  Clock3,
  FileText,
  Gauge,
  Grid2X2,
  Landmark,
  ListFilter,
  TrendingUp,
} from 'lucide-react'
import styles from '../ipo.module.css'

const links = [
  { href: '/ipo', label: 'Dashboard', icon: Grid2X2 },
  { href: '/ipo/current', label: 'Current', icon: TrendingUp },
  { href: '/ipo/upcoming', label: 'Upcoming', icon: Clock3 },
  { href: '/ipo/mainboard', label: 'Mainboard', icon: Landmark },
  { href: '/ipo/sme', label: 'SME', icon: ListFilter },
  { href: '/ipo/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/ipo/subscription', label: 'Subscription', icon: BarChart3 },
  { href: '/ipo/documents', label: 'Documents', icon: FileText },
  { href: '/ipo/analyzer', label: 'Analyzer', icon: Gauge },
]

export default function IpoSubnav({ active = 'Dashboard' }: { active?: string }) {
  return (
    <nav className={styles.ipoSubnav} aria-label="IPO Intelligence navigation">
      <div className={styles.ipoSubnavInner}>
        {links.map(({ href, label, icon: Icon }) => (
          <a href={href} key={href} data-active={active === label}>
            <Icon size={14}/>
            <span>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
