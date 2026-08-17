import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const file = path.join(root, 'app', 'components', 'SiteSearch.tsx')

if (!fs.existsSync(file)) {
  console.error('SiteSearch.tsx not found.')
  process.exit(1)
}

let text = fs.readFileSync(file, 'utf8')
let changed = false

/*
 * V20.3 intentionally preserves the existing working search component.
 * Earlier revisions tried to rewrite the palette structure and became
 * dependent on whether the dialog used <section>, <div>, or different
 * formatting. That is unnecessary for the MF/SEO upgrade.
 *
 * Only apply enhancements when the target is unambiguous.
 */

/* Announce result-count/status changes when the known meta node exists. */
if (
  !text.includes('aria-live="polite"') &&
  text.includes('<div className={styles.paletteMeta}>')
) {
  text = text.replace(
    '<div className={styles.paletteMeta}>',
    '<div className={styles.paletteMeta} aria-live="polite">',
  )
  changed = true
  console.log('  added: aria-live to search status')
}

/* Capture trigger focus only for the exact simple V19 trigger form. */
if (
  text.includes('const returnFocusRef = useRef<HTMLElement | null>(null)') &&
  !text.includes('returnFocusRef.current = event.currentTarget') &&
  text.includes('onClick={() => setOpen(true)}')
) {
  text = text.replace(
    'onClick={() => setOpen(true)}',
    `onClick={(event) => {
          returnFocusRef.current = event.currentTarget
          setOpen(true)
        }}`,
  )
  changed = true
  console.log('  added: safe trigger focus capture')
}

fs.writeFileSync(file, text, 'utf8')

/*
 * Structural validation only. Do not require a specific palette element type.
 * The existing V19 search is allowed to keep its own working implementation.
 */
const required = [
  'export default function SiteSearch',
  'role="dialog"',
  'aria-modal="true"',
  'aria-label="Search CredoNomics"',
]

const missing = required.filter((marker) => !text.includes(marker))

if (missing.length) {
  console.error('Existing SiteSearch is missing expected V19 search structure:')
  for (const marker of missing) console.error(`  - ${marker}`)
  process.exit(1)
}

console.log(
  changed
    ? 'Safe search accessibility polish PASSED.'
    : 'Existing search preserved; no structural rewrite was necessary.',
)