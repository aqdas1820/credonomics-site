import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const file = path.join(root, 'app', 'ipo', 'IPODashboardClient.tsx')

if (!fs.existsSync(file)) {
  console.error('IPODashboardClient.tsx not found.')
  process.exit(1)
}

let text = fs.readFileSync(file, 'utf8')
let changed = false

/*
 * V22.6 is deliberately formatting-independent.
 * It does not assume a particular Prettier layout, indentation or quote style.
 */

/* Repair source-level mojibake left by earlier Windows PowerShell runs. */
const repairs = [
  [/\u00e2\u20ac\u201d/g, '\u2014'],
  [/\u00e2\u20ac\u201c/g, '\u2013'],
  [/\u00e2\u201a\u00b9/g, '\u20b9'],
  [/\u00e2\u20ac\u2122/g, '\u2019'],
  [/\u00c2/g, ''],
]

for (const [pattern, replacement] of repairs) {
  const next = text.replace(pattern, replacement)
  if (next !== text) changed = true
  text = next
}

/*
 * Replace whichever IPO filter declaration currently exists.
 * We first identify a const filters = [...] as const block containing the
 * familiar Open / Upcoming / SME labels, instead of matching exact formatting.
 */
const filtersPattern =
  /const\s+filters\s*=\s*\[[\s\S]*?\]\s*as\s+const/

const filterMatch = text.match(filtersPattern)

if (!filterMatch) {
  console.error('Could not locate IPO filters declaration.')
  process.exit(1)
}

if (
  !/Open/i.test(filterMatch[0]) ||
  !/Upcoming/i.test(filterMatch[0]) ||
  !/SME/i.test(filterMatch[0])
) {
  console.error('Located filters block does not look like the IPO filters.')
  process.exit(1)
}

const desiredFilters = `const filters = [
  ['Market', 'Market'],
  ['Open', 'Open'],
  ['Upcoming', 'Upcoming'],
  ['Recent', 'Recent'],
  ['Filed', 'Research'],
  ['Mainboard', 'Mainboard'],
  ['SME', 'SME'],
] as const`

if (filterMatch[0] !== desiredFilters) {
  text = text.replace(filtersPattern, desiredFilters)
  changed = true
}

/* Default tab = Market, regardless of current quote style/spacing/value. */
const filterStatePattern =
  /const\s+\[\s*filter\s*,\s*setFilter\s*\]\s*=\s*useState\(\s*['"][^'"]*['"]\s*\)/

if (!filterStatePattern.test(text)) {
  console.error('Could not locate IPO filter state declaration.')
  process.exit(1)
}

text = text.replace(
  filterStatePattern,
  "const [filter, setFilter] = useState('Market')",
)

/*
 * Replace displayValue with an encoding-safe implementation.
 * Match the whole simple helper irrespective of its existing fallback glyph.
 */
const displayPattern =
  /function\s+displayValue\s*\([^)]*\)\s*\{[\s\S]*?\n\}/

const desiredDisplay = `function displayValue(
  value: string,
  fallback = '\\u2014',
) {
  const normalized = (value ?? '')
    .trim()
    .replace(/\\u00e2\\u20ac\\u201d/g, '\\u2014')
    .replace(/\\u00e2\\u20ac\\u201c/g, '\\u2013')
    .replace(/\\u00e2\\u201a\\u00b9/g, '\\u20b9')
    .replace(/\\u00c2/g, '')

  return normalized || fallback
}`

if (displayPattern.test(text)) {
  text = text.replace(displayPattern, desiredDisplay)
  changed = true
} else if (!text.includes('function displayValue(')) {
  console.error('Could not locate displayValue helper.')
  process.exit(1)
}

/* Add semantic status label without depending on helper ordering. */
if (!text.includes('function statusLabel(status: string)')) {
  const displayEndPattern =
    /(function\s+displayValue\s*\([^)]*\)\s*\{[\s\S]*?\n\})/

  if (!displayEndPattern.test(text)) {
    console.error('Could not find insertion point for statusLabel.')
    process.exit(1)
  }

  text = text.replace(
    displayEndPattern,
    `$1

function statusLabel(status: string) {
  return status === 'Research' ? 'Filed / Research' : status
}`,
  )
  changed = true
}

/*
 * Add Market + Filed logic before the existing Open check. Support both
 * single/double quotes and arbitrary whitespace.
 */
if (!/filter\s*===\s*['"]Market['"]/.test(text)) {
  const openFilterPattern =
    /(\s*if\s*\(\s*filter\s*===\s*['"]Open['"]\s*\)\s*filterMatch\s*=\s*record\.status\s*===\s*['"]Open['"])/

  const openMatch = text.match(openFilterPattern)

  if (!openMatch) {
    console.error('Could not locate IPO Open-filter logic.')
    process.exit(1)
  }

  const insertion = `
      if (filter === 'Market') {
        filterMatch = record.status !== 'Research'
      }
      if (filter === 'Research') {
        filterMatch = record.status === 'Research'
      }`

  text = text.replace(openFilterPattern, `${insertion}$1`)
  changed = true
}

/* Ensure explicit Filed logic exists even if a Market condition pre-existed. */
if (!/filter\s*===\s*['"]Research['"]/.test(text)) {
  const marketBlockPattern =
    /(if\s*\(\s*filter\s*===\s*['"]Market['"]\s*\)\s*\{[\s\S]*?\})/

  if (!marketBlockPattern.test(text)) {
    console.error('Could not locate Market-filter block for Filed insertion.')
    process.exit(1)
  }

  text = text.replace(
    marketBlockPattern,
    `$1
      if (filter === 'Research') {
        filterMatch = record.status === 'Research'
      }`,
  )
  changed = true
}

/* Present filing-stage status professionally wherever it is rendered as text. */
text = text.replace(
  /\{\s*record\.status\s*\}/g,
  '{statusLabel(record.status)}',
)

/* Update old V21/V22 wording if still present. */
text = text.replace(
  /CredoNomics dataset/gi,
  'Official-source auto feed',
)

text = text.replace(
  /Fields marked[\s\S]{0,180}?normalized public record\./i,
  'Unavailable fields are shown as a dash; filing-stage companies are under Filed.',
)

text = text.replace(
  /Try All, Mainboard, SME or a shorter company name\./g,
  'Try Market, Open, Filed, Mainboard, SME or a company name.',
)

text = text.replace(
  /Try All, Mainboard, SME or a shorter company name/g,
  'Try Market, Open, Filed, Mainboard, SME or a company name',
)

fs.writeFileSync(file, text, 'utf8')

/*
 * Behavioral verification: regex checks meaning, not exact code formatting.
 */
const checks = [
  {
    name: 'Market filter option',
    ok:
      /['"]Market['"]\s*,\s*['"]Market['"]/.test(text),
  },
  {
    name: 'Filed filter option',
    ok:
      /['"]Filed['"]\s*,\s*['"]Research['"]/.test(text),
  },
  {
    name: 'Market default state',
    ok:
      /useState\(\s*['"]Market['"]\s*\)/.test(text),
  },
  {
    name: 'Market behavior',
    ok:
      /filter\s*===\s*['"]Market['"]/.test(text) &&
      /record\.status\s*!==\s*['"]Research['"]/.test(text),
  },
  {
    name: 'Filed behavior',
    ok:
      /filter\s*===\s*['"]Research['"]/.test(text) &&
      /record\.status\s*===\s*['"]Research['"]/.test(text),
  },
  {
    name: 'Filed status label',
    ok:
      text.includes('function statusLabel(status: string)'),
  },
]

const failed = checks.filter((check) => !check.ok)

if (failed.length) {
  for (const check of failed) {
    console.error(`IPO client quality verification failed: ${check.name}`)
  }
  process.exit(1)
}

console.log(
  changed
    ? 'IPO dashboard V22.7 quality patch PASSED.'
    : 'IPO dashboard already satisfied V22.7 quality rules.',
)