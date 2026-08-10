import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CredoNomics — Financial Research & Decision Tools',
    short_name: 'CredoNomics',
    description: 'India-focused financial research and calculators.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f8fb',
    theme_color: '#0ca6a3',
    icons: [
      {
        src: '/credonomics-mark.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
