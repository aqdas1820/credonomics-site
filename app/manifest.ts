import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CredoNomics Investment Solutions',
    short_name: 'CredoNomics',
    description:
      'Financial research, IPO intelligence, mutual-fund portfolio analytics, credit-card economics and transparent decision tools for India.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f8fb',
    theme_color: '#0ca6a3',
    icons: [
      { src: '/favicon-96.png', sizes: '96x96', type: 'image/png' },
      { src: '/credonomics-mark.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}