import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CredoNomics Investment Solutions',
    short_name: 'CredoNomics',
    description:
      'Financial research, investment intelligence and transparent decision tools for India.',
    start_url: '/',
    display: 'standalone',
    background_color: '#05080d',
    theme_color: '#05080d',
    orientation: 'portrait-primary',
    categories: ['finance', 'business', 'productivity'],
    icons: [
      {
        src: '/credonomics-mark.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}