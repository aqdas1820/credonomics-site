import {
  ipoDashboardRecords,
} from '../../data/ipo-dashboard.generated'

type UnknownRecord = Record<string, unknown>

export type IpoSource = {
  name: string
  url: string
}

export type IpoSubscription = {
  qib: string
  nii: string
  retail: string
  employee: string
  total: string
}

export type IpoDetail = {
  slug: string
  company: string
  symbol: string
  status: string
  board: string
  exchange: string
  securityType: string
  dates: {
    open: string
    close: string
    allotment: string
    listing: string
  }
  pricing: {
    priceBand: string
    lotSize: string
    minimumInvestment: string
  }
  issue: {
    issueSize: string
    freshIssue: string
    offerForSale: string
  }
  subscription: IpoSubscription
  promoters: {
    preIssueHolding: string
    postIssueHolding: string
  }
  sources: IpoSource[]
  availability: {
    availableFields: string[]
    missingFields: string[]
    completenessPercent: number
  }
}

const DETAIL_FIELDS = [
  'dates.open',
  'dates.close',
  'dates.allotment',
  'dates.listing',
  'pricing.priceBand',
  'pricing.lotSize',
  'pricing.minimumInvestment',
  'issue.issueSize',
  'issue.freshIssue',
  'issue.offerForSale',
  'subscription.qib',
  'subscription.nii',
  'subscription.retail',
  'subscription.total',
  'promoters.preIssueHolding',
  'promoters.postIssueHolding',
] as const

function asRecord(value: unknown): UnknownRecord {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as UnknownRecord
  }

  return {}
}

function clean(value: unknown): string {
  if (
    value === null ||
    value === undefined
  ) {
    return ''
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    const result = String(value).trim()

    if (
      !result ||
      [
        '-',
        '--',
        'na',
        'n/a',
        'null',
        'undefined',
      ].includes(result.toLowerCase())
    ) {
      return ''
    }

    return result
  }

  return ''
}

function first(
  record: UnknownRecord,
  aliases: string[],
): string {
  for (const alias of aliases) {
    const value = clean(record[alias])

    if (value) {
      return value
    }
  }

  return ''
}

function nestedFirst(
  record: UnknownRecord,
  containerAliases: string[],
  fieldAliases: string[],
): string {
  for (const containerAlias of containerAliases) {
    const container = asRecord(
      record[containerAlias],
    )

    const value = first(
      container,
      fieldAliases,
    )

    if (value) {
      return value
    }
  }

  return ''
}

export function slugifyCompany(
  value: string,
): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeSources(
  record: UnknownRecord,
): IpoSource[] {
  const result: IpoSource[] = []
  const seen = new Set<string>()

  function add(
    nameValue: unknown,
    urlValue: unknown,
  ) {
    const name = clean(nameValue)
    const url = clean(urlValue)

    if (!url) {
      return
    }

    const key = url.toLowerCase()

    if (seen.has(key)) {
      return
    }

    seen.add(key)

    result.push({
      name: name || 'Official source',
      url,
    })
  }

  const sources = record.sources

  if (Array.isArray(sources)) {
    for (const source of sources) {
      if (typeof source === 'string') {
        add('Official source', source)
        continue
      }

      const sourceRecord = asRecord(source)

      add(
        first(
          sourceRecord,
          [
            'name',
            'label',
            'source',
            'title',
          ],
        ),
        first(
          sourceRecord,
          [
            'url',
            'href',
            'link',
          ],
        ),
      )
    }
  }

  for (const [name, aliases] of [
    [
      'SEBI',
      [
        'sebiUrl',
        'sebi_url',
        'sebiLink',
        'sebi_link',
        'drhpUrl',
        'drhp_url',
        'rhpUrl',
        'rhp_url',
      ],
    ],
    [
      'NSE',
      [
        'nseUrl',
        'nse_url',
        'nseLink',
        'nse_link',
      ],
    ],
    [
      'BSE',
      [
        'bseUrl',
        'bse_url',
        'bseLink',
        'bse_link',
      ],
    ],
  ] as const) {
    for (const alias of aliases) {
      add(name, record[alias])
    }
  }

  return result
}

function calculateMinimumInvestment(
  priceBand: string,
  lotSize: string,
  explicitValue: string,
): string {
  if (explicitValue) {
    return explicitValue
  }

  const lotMatch = lotSize.match(
    /\d[\d,]*/,
  )
  const priceMatches = [
    ...priceBand.matchAll(
      /\d[\d,]*(?:\.\d+)?/g,
    ),
  ]

  if (
    !lotMatch ||
    priceMatches.length === 0
  ) {
    return ''
  }

  const lot = Number(
    lotMatch[0].replace(/,/g, ''),
  )

  const highestPrice = Math.max(
    ...priceMatches.map((match) =>
      Number(
        match[0].replace(/,/g, ''),
      ),
    ),
  )

  if (
    !Number.isFinite(lot) ||
    !Number.isFinite(highestPrice) ||
    lot <= 0 ||
    highestPrice <= 0
  ) {
    return ''
  }

  return new Intl.NumberFormat(
    'en-IN',
    {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    },
  ).format(lot * highestPrice)
}

function getPathValue(
  detail: IpoDetail,
  path: string,
): string {
  const parts = path.split('.')
  let current: unknown = detail

  for (const part of parts) {
    current = asRecord(current)[part]
  }

  return clean(current)
}

export function normalizeIpoRecord(
  input: unknown,
): IpoDetail {
  const record = asRecord(input)

  const company =
    first(
      record,
      [
        'company',
        'companyName',
        'company_name',
        'issuer',
        'issuerName',
        'issuer_name',
        'name',
      ],
    ) ||
    'Unnamed IPO'

  const explicitSlug = first(
    record,
    [
      'slug',
      'companySlug',
      'company_slug',
    ],
  )

  const priceBand =
    first(
      record,
      [
        'priceBand',
        'price_band',
        'priceRange',
        'price_range',
      ],
    ) ||
    nestedFirst(
      record,
      [
        'pricing',
        'price',
      ],
      [
        'priceBand',
        'price_band',
        'range',
      ],
    )

  const lotSize =
    first(
      record,
      [
        'lotSize',
        'lot_size',
        'minimumLot',
        'minimum_lot',
        'minBidQuantity',
        'min_bid_quantity',
      ],
    ) ||
    nestedFirst(
      record,
      ['pricing'],
      [
        'lotSize',
        'lot_size',
      ],
    )

  const explicitMinimum =
    first(
      record,
      [
        'minimumInvestment',
        'minimum_investment',
        'minInvestment',
        'min_investment',
      ],
    ) ||
    nestedFirst(
      record,
      ['pricing'],
      [
        'minimumInvestment',
        'minimum_investment',
      ],
    )

  const subscriptionRecord = asRecord(
    record.subscription,
  )

  const detail: IpoDetail = {
    slug:
      explicitSlug ||
      slugifyCompany(company),
    company,
    symbol: first(
      record,
      [
        'symbol',
        'issueSymbol',
        'issue_symbol',
      ],
    ),
    status: first(
      record,
      [
        'status',
        'issueStatus',
        'issue_status',
      ],
    ),
    board: first(
      record,
      [
        'board',
        'segment',
        'market',
      ],
    ),
    exchange: first(
      record,
      [
        'exchange',
        'exchanges',
        'listingExchange',
        'listing_exchange',
      ],
    ),
    securityType: first(
      record,
      [
        'securityType',
        'security_type',
        'issueType',
        'issue_type',
      ],
    ),
    dates: {
      open:
        first(
          record,
          [
            'openDate',
            'open_date',
            'issueOpenDate',
            'issue_open_date',
          ],
        ) ||
        nestedFirst(
          record,
          ['dates'],
          ['open', 'openDate'],
        ),
      close:
        first(
          record,
          [
            'closeDate',
            'close_date',
            'issueCloseDate',
            'issue_close_date',
          ],
        ) ||
        nestedFirst(
          record,
          ['dates'],
          ['close', 'closeDate'],
        ),
      allotment:
        first(
          record,
          [
            'allotmentDate',
            'allotment_date',
            'basisOfAllotmentDate',
            'basis_of_allotment_date',
          ],
        ) ||
        nestedFirst(
          record,
          ['dates'],
          ['allotment', 'allotmentDate'],
        ),
      listing:
        first(
          record,
          [
            'listingDate',
            'listing_date',
            'tentativeListingDate',
            'tentative_listing_date',
          ],
        ) ||
        nestedFirst(
          record,
          ['dates'],
          ['listing', 'listingDate'],
        ),
    },
    pricing: {
      priceBand,
      lotSize,
      minimumInvestment:
        calculateMinimumInvestment(
          priceBand,
          lotSize,
          explicitMinimum,
        ),
    },
    issue: {
      issueSize:
        first(
          record,
          [
            'issueSize',
            'issue_size',
            'totalIssueSize',
            'total_issue_size',
          ],
        ) ||
        nestedFirst(
          record,
          ['issue'],
          ['issueSize', 'total'],
        ),
      freshIssue:
        first(
          record,
          [
            'freshIssue',
            'fresh_issue',
            'freshIssueSize',
            'fresh_issue_size',
          ],
        ) ||
        nestedFirst(
          record,
          ['issue'],
          ['freshIssue', 'fresh'],
        ),
      offerForSale:
        first(
          record,
          [
            'offerForSale',
            'offer_for_sale',
            'ofs',
            'ofsSize',
            'ofs_size',
          ],
        ) ||
        nestedFirst(
          record,
          ['issue'],
          [
            'offerForSale',
            'ofs',
          ],
        ),
    },
    subscription: {
      qib:
        first(
          record,
          [
            'qibSubscription',
            'qib_subscription',
            'qib',
          ],
        ) ||
        first(
          subscriptionRecord,
          ['qib', 'QIB'],
        ),
      nii:
        first(
          record,
          [
            'niiSubscription',
            'nii_subscription',
            'nii',
            'hni',
          ],
        ) ||
        first(
          subscriptionRecord,
          [
            'nii',
            'NII',
            'hni',
            'HNI',
          ],
        ),
      retail:
        first(
          record,
          [
            'retailSubscription',
            'retail_subscription',
            'retail',
          ],
        ) ||
        first(
          subscriptionRecord,
          ['retail', 'Retail'],
        ),
      employee:
        first(
          record,
          [
            'employeeSubscription',
            'employee_subscription',
            'employee',
          ],
        ) ||
        first(
          subscriptionRecord,
          ['employee', 'Employee'],
        ),
      total:
        first(
          record,
          [
            'totalSubscription',
            'total_subscription',
            'subscriptionTimes',
            'subscription_times',
          ],
        ) ||
        first(
          subscriptionRecord,
          [
            'total',
            'overall',
            'times',
          ],
        ) ||
        (
          typeof record.subscription ===
          'string'
            ? clean(record.subscription)
            : ''
        ),
    },
    promoters: {
      preIssueHolding:
        first(
          record,
          [
            'promoterHoldingPre',
            'promoter_holding_pre',
            'preIssuePromoterHolding',
            'pre_issue_promoter_holding',
          ],
        ) ||
        nestedFirst(
          record,
          ['promoters'],
          [
            'preIssueHolding',
            'pre',
          ],
        ),
      postIssueHolding:
        first(
          record,
          [
            'promoterHoldingPost',
            'promoter_holding_post',
            'postIssuePromoterHolding',
            'post_issue_promoter_holding',
          ],
        ) ||
        nestedFirst(
          record,
          ['promoters'],
          [
            'postIssueHolding',
            'post',
          ],
        ),
    },
    sources: normalizeSources(record),
    availability: {
      availableFields: [],
      missingFields: [],
      completenessPercent: 0,
    },
  }

  for (const field of DETAIL_FIELDS) {
    if (getPathValue(detail, field)) {
      detail.availability.availableFields.push(
        field,
      )
    } else {
      detail.availability.missingFields.push(
        field,
      )
    }
  }

  detail.availability.completenessPercent =
    Math.round(
      (
        detail.availability.availableFields
          .length /
        DETAIL_FIELDS.length
      ) *
        100,
    )

  return detail
}

export const ipoDetails: IpoDetail[] =
  (
    ipoDashboardRecords as unknown as unknown[]
  )
    .map(normalizeIpoRecord)
    .filter(
      (detail) =>
        Boolean(detail.company) &&
        Boolean(detail.slug),
    )

export function getIpoDetailBySlug(
  slug: string,
): IpoDetail | null {
  const normalizedSlug = slugifyCompany(
    decodeURIComponent(slug),
  )

  return (
    ipoDetails.find(
      (detail) =>
        detail.slug === slug ||
        detail.slug === normalizedSlug ||
        slugifyCompany(detail.company) ===
          normalizedSlug,
    ) ?? null
  )
}

export function getIpoDetailIndex() {
  return ipoDetails.map((detail) => ({
    slug: detail.slug,
    company: detail.company,
    status: detail.status,
    board: detail.board,
    exchange: detail.exchange,
    completenessPercent:
      detail.availability.completenessPercent,
  }))
}