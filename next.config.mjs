import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    const excludeInline = rules => rules.forEach(rule => {
      if (typeof rule.loader === 'string' && rule.loader.includes('next-image-loader')) {
        rule.resourceQuery = { and: [rule.resourceQuery || /./, { not: [/inline/] }] }
      }
      if (rule.oneOf) excludeInline(rule.oneOf)
    })
    excludeInline(config.module.rules)
    config.module.rules.push({ test: /\.(ttf|png)$/, resourceQuery: /inline/, type: 'javascript/auto', use: [{ loader: fileURLToPath(new URL('./scripts/cloudflare/inline-asset-loader.cjs', import.meta.url)) }] })
    return config
  },
  poweredByHeader: false,
  compress: true,
  outputFileTracingIncludes: {
    '/api/billing/admin/invoices/*/documents/*': ['./assets/fonts/*.ttf'],
    '/api/personal-testing': ['./assets/fonts/*.ttf', './public/credonomics-mark.png'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/pay/i/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; form-action 'none'; base-uri 'none'" },
        ],
      },
    ]
  },
}

export default nextConfig
