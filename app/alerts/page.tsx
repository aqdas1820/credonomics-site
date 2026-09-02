import type { Metadata } from 'next'
import SiteFrame from '../components/SiteFrame'
import AlertsClient from './AlertsClient'
export const metadata: Metadata = { title: 'Price Alerts', description: 'Manage personal equity price and market-move alerts.', alternates: { canonical: '/alerts' } }
export default function Page() { return <SiteFrame><p style={{ width: 'min(1180px, calc(100% - 40px))', margin: '24px auto -30px', color: 'var(--muted)', fontSize: 13 }}>Alerts on this device are stored locally and are evaluated only while you use CredoNomics. Percentage moves use the current session previous close.</p><AlertsClient /></SiteFrame> }
