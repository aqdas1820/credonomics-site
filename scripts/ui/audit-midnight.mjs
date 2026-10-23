import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const base = 'a0ba47d10fbbf2131a8a3c2700aa96b65dce06e8'
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(path.join(dir, item.name)) : [path.join(dir, item.name)])
}
const pages = walk('app').filter(file => file.endsWith('/page.tsx')).sort()
const api = walk('app/api').filter(file => /route\.[jt]s$/.test(file))
const changes = execFileSync('git', ['diff', '--name-only', base], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
const protectedChanges = changes.filter(file => /^(src\/|app\/(api|auth|data|lib|seo)\/|middleware\.|next.config|package|supabase\/|\.github\/|vercel.json)/.test(file))
if (protectedChanges.length) throw new Error(`Unexpected changes outside presentation: ${protectedChanges.join(', ')}`)
// Check presentation edits did not change MF calculations, fetching, or event handlers.
const mf = 'app/tools/mf-portfolio-tracker/MFPortfolioClient.tsx'
const before = execFileSync('git', ['show', `${base}:${mf}`], { encoding: 'utf8' }).split('const styles = `')[0].replaceAll('<main ', '<div ').replaceAll('</main>', '</div>')
const after = fs.readFileSync(mf, 'utf8').split('const styles = `')[0]
if (before !== after) throw new Error('MF financial/interaction code changed')
const family = route => /^\/(account|alerts|watchlist)/.test(route) ? 'Calm shared shell; no new motion or account logic' : /^\/(about|contact|corrections|disclosures|official|privacy|terms|methodology)/.test(route) ? 'Shared tokens and editorial typography; legal copy retained' : route === '/' ? 'Signature SVG hero, static category links, existing financial states' : 'Shared tokens, contextual workflow accent, existing data UI'
const rows = pages.map(file => {
  const route = file.replace(/^app/, '').replace(/\/page.tsx$/, '') || '/'
  return `| \`${route}\` | \`${file}\` | ${family(route)} |`
})
fs.mkdirSync('docs/midnight', { recursive: true })
fs.writeFileSync('docs/midnight/UI_ROUTE_AUDIT.md', `# Route and boundary audit\n\nBase commit: \`${base}\`. ${pages.length} page templates; ${api.length} API route handlers.\n\nNext.js 14.2.35 App Router, React 18.3.1, TypeScript, CSS modules/global CSS, styled-jsx MF terminal, lucide-react; existing lightweight-charts. No new production dependencies.\n\nShared entry: app/layout.tsx → globals.css + midnight.css; SiteFrame → SiteHeader, SiteExperience, main, SiteFooter. MF has its own layout; quick calculators use CalculatorShell. Dynamic records retain existing generateStaticParams/data sources. Template coverage is not a claim of visual verification of every record.\n\n| Route template | Source | Presentation coverage |\n|---|---|---|\n${rows.join('\n')}\n\n## Boundaries and exceptions\n\n- APIs, account/authentication policies, Supabase, Upstox providers, calculations, source records, SEO modules, financial data generation and payment logic are unchanged.\n- Existing account/alerts/watchlist receive shell styling only; no account actions were performed.\n- YouPI checkout, Gmail Observer, Merchant Admin and Cloudflare subdomains are separate applications. Their repositories were not opened or modified. Their security and payment behavior are outside this branch.\n- No static HTML applications were found in public/. Existing document/PDF links and metadata are retained.\n- Existing support component and its disabled-payment behavior are unchanged.\n- 404 and error/loading states inherit global tokens; their recovery logic is unchanged.\n- Rendered visual QA, browser contrast/zoom tests and real-user Web Vitals remain release gates until the browser environment is available.\n`)
console.log(JSON.stringify({ base, pageTemplates: pages.length, apiHandlers: api.length, protectedChanges, mfLogicUnchanged: true }))
