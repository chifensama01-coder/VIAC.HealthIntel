const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['leaflet'],
  outputFileTracingRoot: path.join(__dirname),
  // Custom headers for SSE support
  async headers() {
    return [
      {
        source: '/api/events',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Cache-Control', value: 'no-cache, no-transform' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
