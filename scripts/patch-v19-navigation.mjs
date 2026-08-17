import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const footerFile = path.join(root, 'app', 'components', 'SiteFooter.tsx')

if (fs.existsSync(footerFile)) {
  let footer = fs.readFileSync(footerFile, 'utf8')

  if (!footer.includes('href="/discover"')) {
    const reportsLink =
      /<a\s+href=["']\/reports["'][^>]*>[\s\S]*?<\/a>/

    const reportsMatch = footer.match(reportsLink)

    if (reportsMatch) {
      footer = footer.replace(
        reportsMatch[0],
        `${reportsMatch[0]}\n          <a href="/discover">Intelligence Discovery</a>`,
      )
    } else {
      const researchDesk =
        /<a\s+href=["']\/research["'][^>]*>[\s\S]*?<\/a>/

      const researchMatch = footer.match(researchDesk)

      if (researchMatch) {
        footer = footer.replace(
          researchMatch[0],
          `${researchMatch[0]}\n          <a href="/discover">Intelligence Discovery</a>`,
        )
      }
    }
  }

  fs.writeFileSync(footerFile, footer, 'utf8')
}

console.log('Footer discovery navigation patch complete.')
console.log('Existing app/sitemap.ts was intentionally left untouched.')