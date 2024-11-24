/** @type {import('next').NextConfig} */
const stagingConfig = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' 
  ? require('./config/staging.config.js')
  : {};

const nextConfig = {
  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    ...stagingConfig.env,
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
  // Merge staging-specific configuration
  ...(process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' ? stagingConfig : {}),
}

module.exports = nextConfig