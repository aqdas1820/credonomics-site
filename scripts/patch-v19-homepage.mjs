import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const pageFile = path.join(root, 'app', 'page.tsx')

if (!fs.existsSync(pageFile)) {
  console.error('app/page.tsx not found.')
  process.exit(1)
}

let text = fs.readFileSync(pageFile, 'utf8')

if (
  !text.includes("from './components/HomepageDiscovery'") &&
  !text.includes('from "./components/HomepageDiscovery"')
) {
  const firstImport = text.match(/^import .*$/m)?.[0]

  if (!firstImport) {
    console.error('Could not locate homepage import anchor.')
    process.exit(1)
  }

  text = text.replace(
    firstImport,
    `${firstImport}\nimport HomepageDiscovery from './components/HomepageDiscovery'`,
  )
}

if (!text.includes('<HomepageDiscovery />')) {
  const reportBanner = '<LatestReportBanner />'

  if (text.includes(reportBanner)) {
    text = text.replace(
      reportBanner,
      `${reportBanner}\n      <HomepageDiscovery />`,
    )
  } else if (text.includes('</SiteFrame>')) {
    text = text.replace(
      '</SiteFrame>',
      '      <HomepageDiscovery />\n    </SiteFrame>',
    )
  } else {
    const closingMain = text.lastIndexOf('</main>')

    if (closingMain < 0) {
      console.error('Could not safely locate homepage insertion point.')
      process.exit(1)
    }

    text =
      text.slice(0, closingMain) +
      '      <HomepageDiscovery />\n' +
      text.slice(closingMain)
  }
}

fs.writeFileSync(pageFile, text, 'utf8')

if ((text.match(/<HomepageDiscovery \/>/g) ?? []).length !== 1) {
  console.error('Expected exactly one HomepageDiscovery module.')
  process.exit(1)
}

console.log('Homepage discovery integration PASSED.')