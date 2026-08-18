import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const file = path.join(root, 'app', 'page.tsx')

if (!fs.existsSync(file)) {
  console.error('app/page.tsx not found.')
  process.exit(1)
}

let text = fs.readFileSync(file, 'utf8')

const importLine =
  "import HomeIntelligenceRail from './components/HomeIntelligenceRail'"

if (!text.includes(importLine)) {
  const importMatches = [
    ...text.matchAll(/^import .*$/gm),
  ]

  if (importMatches.length) {
    const last = importMatches.at(-1)
    const insertAt =
      last.index + last[0].length

    text =
      text.slice(0, insertAt) +
      `\n${importLine}` +
      text.slice(insertAt)
  } else {
    const clientDirective =
      text.match(/^['"]use client['"];?\s*/)

    const insertAt = clientDirective
      ? clientDirective[0].length
      : 0

    text =
      text.slice(0, insertAt) +
      `\n${importLine}\n` +
      text.slice(insertAt)
  }
}

const marker = '<HomeIntelligenceRail />'

if (!text.includes(marker)) {
  const closingMain = text.lastIndexOf('</main>')

  if (closingMain >= 0) {
    text =
      text.slice(0, closingMain) +
      `\n        ${marker}\n      ` +
      text.slice(closingMain)
  } else {
    const closingFrame =
      text.lastIndexOf('</SiteFrame>')

    if (closingFrame >= 0) {
      text =
        text.slice(0, closingFrame) +
        `\n      ${marker}\n    ` +
        text.slice(closingFrame)
    } else {
      console.error(
        'Could not find a safe homepage insertion point. ' +
        'Expected </main> or </SiteFrame>.',
      )
      process.exit(1)
    }
  }
}

const occurrences = (
  text.match(/<HomeIntelligenceRail \/>/g) ?? []
).length

if (occurrences !== 1) {
  console.error(
    `Expected exactly one HomeIntelligenceRail, found ${occurrences}.`,
  )
  process.exit(1)
}

fs.writeFileSync(file, text, 'utf8')

console.log(
  'Homepage Live Intelligence Center integration PASSED.',
)