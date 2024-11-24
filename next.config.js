/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  },
  images: {
    domains: ['unpkg.com'],
    unoptimized: true
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Add your rewrites here
      ],
    }
  },
}

module.exports = nextConfig