import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CredoNomics — Indian Credit Card Intelligence',
    short_name: 'CredoNomics',
    description:
      'Real Indian credit-card rankings and financial decision tools using transparent, source-linked calculations.',
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
