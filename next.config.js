/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static exports
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: '/id2025',  // Replace with your repository name
  assetPrefix: '/id2025/',  // Replace with your repository name
  // Disable API routes for static export
  rewrites: async () => [],
  // Exclude API routes from static export
  experimental: {
    excludePages: ['/api/**']
  }
}

module.exports = nextConfig