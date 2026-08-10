export type IssuerGroup =
  | 'Public-sector / government-linked'
  | 'Private-sector'
  | 'Foreign / international'
  | 'Regional / small-finance / cooperative'

export type IssuerRegistryEntry = {
  slug: string
  name: string
  aliases: string[]
  group: IssuerGroup
  discoveryAutomation: boolean
}

export const issuerRegistry: IssuerRegistryEntry[] = [
  { slug: 'sbi-card', name: 'SBI Card', aliases: ['SBI Card'], group: 'Public-sector / government-linked', discoveryAutomation: true },
  { slug: 'bobcard', name: 'BOBCARD / Bank of Baroda', aliases: ['BOBCARD', 'Bank of Baroda'], group: 'Public-sector / government-linked', discoveryAutomation: false },
  { slug: 'bank-of-india', name: 'Bank of India', aliases: ['Bank of India'], group: 'Public-sector / government-linked', discoveryAutomation: false },
  { slug: 'bank-of-maharashtra', name: 'Bank of Maharashtra', aliases: ['Bank of Maharashtra'], group: 'Public-sector / government-linked', discoveryAutomation: false },
  { slug: 'canara-bank', name: 'Canara Bank', aliases: ['Canara Bank'], group: 'Public-sector / government-linked', discoveryAutomation: false },
  { slug: 'indian-bank', name: 'Indian Bank', aliases: ['Indian Bank'], group: 'Public-sector / government-linked', discoveryAutomation: false },
  { slug: 'indian-overseas-bank', name: 'Indian Overseas Bank', aliases: ['Indian Overseas Bank'], group: 'Public-sector / government-linked', discoveryAutomation: false },
  { slug: 'punjab-national-bank', name: 'Punjab National Bank', aliases: ['Punjab National Bank', 'PNB'], group: 'Public-sector / government-linked', discoveryAutomation: false },
  { slug: 'union-bank-of-india', name: 'Union Bank of India', aliases: ['Union Bank of India'], group: 'Public-sector / government-linked', discoveryAutomation: false },

  { slug: 'hdfc-bank', name: 'HDFC Bank', aliases: ['HDFC Bank'], group: 'Private-sector', discoveryAutomation: true },
  { slug: 'icici-bank', name: 'ICICI Bank', aliases: ['ICICI Bank'], group: 'Private-sector', discoveryAutomation: true },
  { slug: 'axis-bank', name: 'Axis Bank', aliases: ['Axis Bank'], group: 'Private-sector', discoveryAutomation: true },
  { slug: 'kotak-mahindra-bank', name: 'Kotak Mahindra Bank', aliases: ['Kotak Mahindra Bank'], group: 'Private-sector', discoveryAutomation: true },
  { slug: 'idfc-first-bank', name: 'IDFC FIRST Bank', aliases: ['IDFC FIRST Bank'], group: 'Private-sector', discoveryAutomation: true },
  { slug: 'indusind-bank', name: 'IndusInd Bank', aliases: ['IndusInd Bank'], group: 'Private-sector', discoveryAutomation: true },
  { slug: 'rbl-bank', name: 'RBL Bank', aliases: ['RBL Bank'], group: 'Private-sector', discoveryAutomation: true },
  { slug: 'yes-bank', name: 'YES BANK', aliases: ['YES BANK', 'Yes Bank'], group: 'Private-sector', discoveryAutomation: true },
  { slug: 'federal-bank', name: 'Federal Bank', aliases: ['Federal Bank'], group: 'Private-sector', discoveryAutomation: true },
  { slug: 'au-small-finance-bank', name: 'AU Small Finance Bank', aliases: ['AU Small Finance Bank', 'AU Bank'], group: 'Private-sector', discoveryAutomation: true },
  { slug: 'south-indian-bank', name: 'South Indian Bank', aliases: ['South Indian Bank'], group: 'Private-sector', discoveryAutomation: false },
  { slug: 'csb-bank', name: 'CSB Bank', aliases: ['CSB Bank'], group: 'Private-sector', discoveryAutomation: false },
  { slug: 'city-union-bank', name: 'City Union Bank', aliases: ['City Union Bank'], group: 'Private-sector', discoveryAutomation: false },
  { slug: 'dhanlaxmi-bank', name: 'Dhanlaxmi Bank', aliases: ['Dhanlaxmi Bank'], group: 'Private-sector', discoveryAutomation: false },
  { slug: 'idbi-bank', name: 'IDBI Bank', aliases: ['IDBI Bank'], group: 'Private-sector', discoveryAutomation: false },
  { slug: 'jammu-kashmir-bank', name: 'Jammu & Kashmir Bank', aliases: ['Jammu & Kashmir Bank', 'J&K Bank'], group: 'Private-sector', discoveryAutomation: false },
  { slug: 'karur-vysya-bank', name: 'Karur Vysya Bank', aliases: ['Karur Vysya Bank'], group: 'Private-sector', discoveryAutomation: false },
  { slug: 'tamilnad-mercantile-bank', name: 'Tamilnad Mercantile Bank', aliases: ['Tamilnad Mercantile Bank'], group: 'Private-sector', discoveryAutomation: false },
  { slug: 'bandhan-bank', name: 'Bandhan Bank', aliases: ['Bandhan Bank'], group: 'Private-sector', discoveryAutomation: false },

  { slug: 'american-express-india', name: 'American Express India', aliases: ['American Express India', 'American Express'], group: 'Foreign / international', discoveryAutomation: true },
  { slug: 'hsbc-india', name: 'HSBC India', aliases: ['HSBC India'], group: 'Foreign / international', discoveryAutomation: true },
  { slug: 'standard-chartered-india', name: 'Standard Chartered India', aliases: ['Standard Chartered India', 'Standard Chartered'], group: 'Foreign / international', discoveryAutomation: true },
  { slug: 'dbs-bank-india', name: 'DBS Bank India', aliases: ['DBS Bank India', 'DBS Bank'], group: 'Foreign / international', discoveryAutomation: false },
  { slug: 'sbm-bank-india', name: 'SBM Bank India', aliases: ['SBM Bank India', 'SBM Bank'], group: 'Foreign / international', discoveryAutomation: false },

  { slug: 'utkarsh-small-finance-bank', name: 'Utkarsh Small Finance Bank', aliases: ['Utkarsh Small Finance Bank', 'Utkarsh SFB'], group: 'Regional / small-finance / cooperative', discoveryAutomation: false },
  { slug: 'esaf-small-finance-bank', name: 'ESAF Small Finance Bank', aliases: ['ESAF Small Finance Bank', 'ESAF SFB'], group: 'Regional / small-finance / cooperative', discoveryAutomation: false },
  { slug: 'saraswat-cooperative-bank', name: 'Saraswat Cooperative Bank', aliases: ['Saraswat Cooperative Bank', 'Saraswat Bank'], group: 'Regional / small-finance / cooperative', discoveryAutomation: false },
]

export const issuerGroups: IssuerGroup[] = [
  'Public-sector / government-linked',
  'Private-sector',
  'Foreign / international',
  'Regional / small-finance / cooperative',
]

export function issuerBySlug(slug: string) {
  return issuerRegistry.find((issuer) => issuer.slug === slug)
}

export function issuerForName(name: string) {
  const lower = name.trim().toLowerCase()
  return issuerRegistry.find((issuer) =>
    issuer.aliases.some((alias) => alias.toLowerCase() === lower),
  )
}

export function issuerMatchesName(issuer: IssuerRegistryEntry, name: string) {
  const lower = name.trim().toLowerCase()
  return issuer.aliases.some((alias) => alias.toLowerCase() === lower)
}
