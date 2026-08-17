export default function SiteStructuredData() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CredoNomics Investment Solutions',
    alternateName: 'CredoNomics',
    url: 'https://www.credonomics.in',
    logo: 'https://www.credonomics.in/credonomics-mark.png',
    description:
      'India-focused financial research, investment intelligence and transparent decision tools.',
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CredoNomics',
    alternateName: 'CredoNomics Investment Solutions',
    url: 'https://www.credonomics.in',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  )
}