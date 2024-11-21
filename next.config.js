/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/id2025' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/id2025/' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig