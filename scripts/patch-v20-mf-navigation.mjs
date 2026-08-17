import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const targets = [
  path.join(root, 'app', 'components', 'SiteHeader.tsx'),
  path.join(root, 'app', 'components', 'SiteFooter.tsx'),
]

for (const file of targets) {
  if (!fs.existsSync(file)) continue

  let text = fs.readFileSync(file, 'utf8')
  const before = text

  // Only rewrite links whose visible label identifies them as Mutual Funds /
  // Mutual Fund Intelligence. Tool-specific "Open tracker" links remain direct.
  text = text.replace(
    /(<a\b[^>]*href=["'])\/tools\/mf-portfolio-tracker(["'][^>]*>[\s\S]*?Mutual Fund(?:s| Intelligence)?[\s\S]*?<\/a>)/gi,
    '$1/mutual-funds$2',
  )

  text = text.replace(
    /(<Link\b[^>]*href=["'])\/tools\/mf-portfolio-tracker(["'][^>]*>[\s\S]*?Mutual Fund(?:s| Intelligence)?[\s\S]*?<\/Link>)/gi,
    '$1/mutual-funds$2',
  )

  // Support nav configuration objects.
  text = text.replace(
    /(\{\s*label:\s*['"]Mutual Fund(?:s| Intelligence)['"]\s*,\s*href:\s*['"])\/tools\/mf-portfolio-tracker(['"])/gi,
    '$1/mutual-funds$2',
  )

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8')
    console.log(`Updated mutual-fund navigation in ${path.relative(root, file)}`)
  } else {
    console.log(`No compatible mutual-fund nav pattern changed in ${path.relative(root, file)}`)
  }
}

console.log('Mutual-fund navigation patch completed safely.')