/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    domains: ['unpkg.com'],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  basePath: '/id2025',
  assetPrefix: '/id2025'
}

module.exports = nextConfig