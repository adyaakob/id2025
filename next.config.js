/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['unpkg.com'],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  swcMinify: true
}

module.exports = nextConfig