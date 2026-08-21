import type { Metadata } from 'next'

export const SITE_URL = 'https://www.credonomics.in'
export const BRAND_NAME = 'CredoNomics'
export const SITE_NAME = 'CredoNomics Investment Solutions'
export const SITE_TITLE =
  'CredoNomics Investment Solutions | Financial Research & Intelligence'
export const SITE_DESCRIPTION =
  'CredoNomics Investment Solutions is an India-focused financial research and intelligence platform covering IPO intelligence, mutual-fund portfolio analytics, credit-card economics and transparent decision tools.'

const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  process.env.GOOGLE_SITE_VERIFICATION ||
  ''

export function mergeRootMetadata(base: Metadata = {}): Metadata {
  return {
    ...base,
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: {
      default: SITE_TITLE,
      template: `%s | ${BRAND_NAME}`,
    },
    description: SITE_DESCRIPTION,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'financial research',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      ...(base.openGraph ?? {}),
      type: 'website',
      locale: 'en_IN',
      siteName: SITE_NAME,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images:
        base.openGraph?.images ??
        [{
          url: '/opengraph-image',
          alt: 'CredoNomics Investment Solutions financial research and intelligence',
        }],
    },
    twitter: {
      ...(base.twitter ?? {}),
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: base.twitter?.images ?? ['/twitter-image'],
    },
    verification: googleVerification
      ? {
          ...(base.verification ?? {}),
          google: googleVerification,
        }
      : base.verification,
  }
}

export function mergeHomeMetadata(base: Metadata = {}): Metadata {
  const root = mergeRootMetadata(base)

  return {
    ...root,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    alternates: {
      ...(base.alternates ?? {}),
      canonical: '/',
    },
    openGraph: {
      ...(root.openGraph ?? {}),
      url: '/',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    },
  }
}

export const OFFICIAL_PAGE_TITLE =
  'Official Identity | CredoNomics Investment Solutions'
export const OFFICIAL_PAGE_DESCRIPTION =
  'Official website and identity information for CredoNomics Investment Solutions at credonomics.in.'