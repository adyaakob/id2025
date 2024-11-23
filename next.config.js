/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['unpkg.com'],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig