import {
  existsSync,
  readdirSync,
} from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import {
  ipoDashboardRecords,
} from '../../data/ipo-dashboard.generated'
import { readPublicJson } from '../../../src/services/server/public-json'

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

function stringValue(
  value: unknown,
  fallback = '',
): string {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : fallback
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

  const metadata = data.metadata
  if (metadata && typeof metadata === 'object') {
    return stringValue((metadata as JsonRecord).generatedAt)
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

function collectionCount(
  data: unknown,
  preferredKeys: string[] = [],
): number {
  if (!data) {
    return 0
  }

  if (Array.isArray(data)) {
    return data.length
  }

  if (typeof data !== 'object') {
    return 0
  }

  const record = data as JsonRecord

  for (const key of preferredKeys) {
    const value = record[key]

    if (Array.isArray(value)) {
      return value.length
    }

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const count = Object.keys(
        value as JsonRecord,
      ).length

      if (count > 0) {
        return count
      }
    }
  }

  const directKeys = Object.keys(record)

  if (
    directKeys.length > 0 &&
    !directKeys.every((key) =>
      [
        'generatedAt',
        'generated_at',
        'updatedAt',
        'updated_at',
        'asOf',
        'as_of',
        'version',
        'meta',
        'metadata',
      ].includes(key),
    )
  ) {
    return directKeys.length
  }

  return 0
}

function mfSummary(payloads: {
  index: JsonRecord | null
  schemes: JsonRecord | null
  portfolios: JsonRecord | null
  holdings: JsonRecord | null
  latest: JsonRecord | null
  manifest: JsonRecord | null
}) {
  const metadata = payloads.index?.metadata && typeof payloads.index.metadata === 'object'
    ? payloads.index.metadata as JsonRecord
    : {}
  const context = {
    availability: stringValue(metadata.availability, 'unavailable'),
    asOf: stringValue(metadata.asOf),
    quality: stringValue(metadata.quality, 'unknown'),
  }
  const schemeCount = Math.max(
    collectionCount(
      payloads.schemes,
      ['schemes', 'funds', 'data', 'items'],
    ),
    collectionCount(
      payloads.index,
      ['schemes', 'funds'],
    ),
  )

  const portfolioCount = Math.max(
    collectionCount(
      payloads.portfolios,
      ['portfolios', 'funds', 'data', 'items'],
    ),
    collectionCount(
      payloads.index,
      ['portfolios'],
    ),
  )

  const holdingCount = Math.max(
    collectionCount(
      payloads.holdings,
      ['holdings', 'data', 'items'],
    ),
    collectionCount(
      payloads.index,
      [
        'holdings',
        'holdingsPublic',
        'holdings_public',
      ],
    ),
  )

  const available = Boolean(
    payloads.index ||
    payloads.schemes ||
    payloads.portfolios ||
    payloads.holdings ||
    payloads.latest ||
    payloads.manifest
  )

  if (schemeCount > 0) {
    return {
      available: true,
      count: schemeCount,
      label:
        schemeCount === 1
          ? 'scheme indexed'
          : 'schemes indexed',
      ...context,
    }
  }

  if (portfolioCount > 0) {
    return {
      available: true,
      count: portfolioCount,
      label:
        portfolioCount === 1
          ? 'portfolio indexed'
          : 'portfolios indexed',
      ...context,
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
      ...context,
    }
  }

  if (available) {
    return {
      available: true,
      count: 0,
      label: 'Portfolio dataset online',
      ...context,
    }
  }

  return {
    available: false,
    count: 0,
    label: 'Tracker available',
    ...context,
  }
}

function statusOf(status: unknown): string {
  return stringValue(status).toLowerCase()
}

function boardOf(board: unknown): string {
  return stringValue(board).toLowerCase()
}

export async function GET() {
  // Use the exact same generated records consumed by /ipo.
  // This prevents homepage counts from diverging from the IPO dashboard.
  const issues = ipoDashboardRecords

  const open = issues.filter(
    (issue) => statusOf(issue.status) === 'open',
  ).length

  const upcoming = issues.filter(
    (issue) => statusOf(issue.status) === 'upcoming',
  ).length

  const filed = issues.filter((issue) =>
    [
      'research',
      'filed',
      'filed / research',
    ].includes(statusOf(issue.status)),
  ).length

  const market = issues.filter(
    (issue) =>
      ![
        'research',
        'filed',
        'filed / research',
      ].includes(statusOf(issue.status)),
  ).length

  const mainboard = issues.filter(
    (issue) => boardOf(issue.board) === 'mainboard',
  ).length

  const sme = issues.filter(
    (issue) => boardOf(issue.board) === 'sme',
  ).length

  const [
    ipoMeta,
    mfIndex,
    mfSchemes,
    mfPortfolios,
    mfHoldings,
    mfLatest,
    mfManifest,
  ] = await Promise.all([
    readPublicJson(
      '/data/ipo-intelligence/index.json',
    ),
    readPublicJson(
      '/data/mf-intelligence/v2/index.json',
    ),
    Promise.resolve(null),
    Promise.resolve(null),
    Promise.resolve(null),
    readPublicJson(
      '/data/mf-intelligence/v2/latest.json',
    ),
    readPublicJson(
      '/data/mf-intelligence/v2/manifest.json',
    ),
  ])

  const sourceHealth =
    ipoMeta &&
    ipoMeta.sourceHealth &&
    typeof ipoMeta.sourceHealth === 'object'
      ? (ipoMeta.sourceHealth as JsonRecord)
      : {}

  const healthySourceCount = Object.entries(
    sourceHealth,
  ).filter(
    ([key, value]) =>
      (
        value === true ||
        (typeof value === 'number' && value > 0)
      ) &&
      (
        key.toLowerCase().includes('api') ||
        key.toLowerCase().includes('record') ||
        key.toLowerCase().includes('source')
      ),
  ).length

  const report = latestReport()
  const mutualFunds = mfSummary({
    index: mfIndex,
    schemes: mfSchemes,
    portfolios: mfPortfolios,
    holdings: mfHoldings,
    latest: mfLatest,
    manifest: mfManifest,
  })

  return NextResponse.json(
    {
      generatedAt:
        generatedAt(ipoMeta) ||
        generatedAt(mfLatest) ||
        generatedAt(mfManifest) ||
        generatedAt(mfIndex) ||
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
