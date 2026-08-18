import {
  existsSync,
  readFileSync,
  readdirSync,
} from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type JsonRecord = Record<string, unknown>

type ReportSummary = {
  title: string
  href: string
  fileName: string
  period: string
}

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
}

function readJson(relativePath: string): JsonRecord | null {
  const fullPath = path.join(process.cwd(), relativePath)

  if (!existsSync(fullPath)) {
    return null
  }

  try {
    return JSON.parse(
      readFileSync(fullPath, 'utf8'),
    ) as JsonRecord
  } catch {
    return null
  }
}

function asArray(value: unknown): JsonRecord[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(
    (item): item is JsonRecord =>
      Boolean(item) &&
      typeof item === 'object' &&
      !Array.isArray(item),
  )
}

function stringValue(
  value: unknown,
  fallback = '',
): string {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : fallback
}

function statusOf(issue: JsonRecord): string {
  return stringValue(issue.status).toLowerCase()
}

function boardOf(issue: JsonRecord): string {
  return stringValue(issue.board).toLowerCase()
}

function countFirstArray(
  data: JsonRecord | null,
  keys: string[],
): number {
  if (!data) {
    return 0
  }

  for (const key of keys) {
    const value = data[key]

    if (Array.isArray(value)) {
      return value.length
    }
  }

  return 0
}

function generatedAt(
  data: JsonRecord | null,
): string {
  if (!data) {
    return ''
  }

  for (const key of [
    'generatedAt',
    'generated_at',
    'updatedAt',
    'updated_at',
    'asOf',
    'as_of',
  ]) {
    const value = stringValue(data[key])

    if (value) {
      return value
    }
  }

  return ''
}

function reportRank(fileName: string): number {
  const lower = fileName.toLowerCase()

  for (const [month, monthNumber] of Object.entries(
    MONTHS,
  )) {
    const match = lower.match(
      new RegExp(`${month}[-_ ]?(20\\d{2})`),
    )

    if (match) {
      return Number(match[1]) * 100 + monthNumber
    }

    const reverse = lower.match(
      new RegExp(`(20\\d{2})[-_ ]?${month}`),
    )

    if (reverse) {
      return Number(reverse[1]) * 100 + monthNumber
    }
  }

  const year = lower.match(/20\d{2}/)

  return year ? Number(year[0]) * 100 : 0
}

function titleFromFile(fileName: string): string {
  const withoutExtension = fileName.replace(
    /\.pdf$/i,
    '',
  )

  const cleaned = withoutExtension
    .replace(/^credonomics[-_ ]*/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) {
    return 'CredoNomics Research Report'
  }

  return cleaned
    .split(' ')
    .map((word) => {
      const lower = word.toLowerCase()

      if (
        [
          'ipo',
          'mf',
          'nse',
          'bse',
          'sebi',
        ].includes(lower)
      ) {
        return lower.toUpperCase()
      }

      if (/^20\d{2}$/.test(word)) {
        return word
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
      )
    })
    .join(' ')
}

function reportPeriod(fileName: string): string {
  const lower = fileName.toLowerCase()

  for (const month of Object.keys(MONTHS)) {
    const match = lower.match(
      new RegExp(`${month}[-_ ]?(20\\d{2})`),
    )

    if (match) {
      return `${
        month.charAt(0).toUpperCase() +
        month.slice(1)
      } ${match[1]}`
    }

    const reverse = lower.match(
      new RegExp(`(20\\d{2})[-_ ]?${month}`),
    )

    if (reverse) {
      return `${
        month.charAt(0).toUpperCase() +
        month.slice(1)
      } ${reverse[1]}`
    }
  }

  return ''
}

function latestReport(): ReportSummary | null {
  const reportsDir = path.join(
    process.cwd(),
    'public',
    'reports',
  )

  if (!existsSync(reportsDir)) {
    return null
  }

  const reports = readdirSync(reportsDir)
    .filter((name) => /\.pdf$/i.test(name))
    .sort((a, b) => {
      const rankDifference =
        reportRank(b) - reportRank(a)

      if (rankDifference !== 0) {
        return rankDifference
      }

      return b.localeCompare(a)
    })

  const fileName = reports[0]

  if (!fileName) {
    return null
  }

  return {
    title: titleFromFile(fileName),
    href: `/reports/${encodeURIComponent(
      fileName,
    )}`,
    fileName,
    period: reportPeriod(fileName),
  }
}

function mfSummary(data: JsonRecord | null) {
  if (!data) {
    return {
      available: false,
      count: 0,
      label: 'Tracker available',
    }
  }

  const schemeCount = countFirstArray(data, [
    'schemes',
    'funds',
    'portfolios',
  ])

  const holdingCount = countFirstArray(data, [
    'holdings',
    'holdingsPublic',
    'holdings_public',
  ])

  if (schemeCount > 0) {
    return {
      available: true,
      count: schemeCount,
      label:
        schemeCount === 1
          ? 'scheme indexed'
          : 'schemes indexed',
    }
  }

  if (holdingCount > 0) {
    return {
      available: true,
      count: holdingCount,
      label:
        holdingCount === 1
          ? 'holding indexed'
          : 'holdings indexed',
    }
  }

  return {
    available: true,
    count: 0,
    label: 'Portfolio dataset online',
  }
}

export async function GET() {
  const ipo = readJson(
    'public/data/ipo-intelligence/index.json',
  )
  const mf = readJson(
    'public/data/mf-intelligence/index.json',
  )

  const issues = asArray(ipo?.issues)

  const open = issues.filter(
    (issue) => statusOf(issue) === 'open',
  ).length

  const upcoming = issues.filter(
    (issue) => statusOf(issue) === 'upcoming',
  ).length

  const filed = issues.filter((issue) =>
    [
      'research',
      'filed',
      'filed / research',
    ].includes(statusOf(issue)),
  ).length

  const market = issues.filter(
    (issue) =>
      ![
        'research',
        'filed',
        'filed / research',
      ].includes(statusOf(issue)),
  ).length

  const mainboard = issues.filter(
    (issue) => boardOf(issue) === 'mainboard',
  ).length

  const sme = issues.filter(
    (issue) => boardOf(issue) === 'sme',
  ).length

  const sourceHealth =
    ipo &&
    ipo.sourceHealth &&
    typeof ipo.sourceHealth === 'object'
      ? (ipo.sourceHealth as JsonRecord)
      : {}

  const healthySourceCount = Object.values(
    sourceHealth,
  ).filter(
    (value) =>
      value === true ||
      (typeof value === 'number' && value > 0),
  ).length

  const report = latestReport()
  const mutualFunds = mfSummary(mf)

  return NextResponse.json(
    {
      generatedAt:
        generatedAt(ipo) ||
        generatedAt(mf) ||
        new Date().toISOString(),
      ipo: {
        total: issues.length,
        market,
        open,
        upcoming,
        filed,
        mainboard,
        sme,
        healthySourceCount,
      },
      mutualFunds,
      report,
      links: {
        ipo: '/ipo',
        mutualFunds: '/mutual-funds',
        reports: '/reports',
        research: '/research',
      },
    },
    {
      headers: {
        'Cache-Control':
          'no-store, max-age=0',
      },
    },
  )
}