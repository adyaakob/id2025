/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static exports
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: '/id2025',  // Replace with your repository name
  assetPrefix: '/id2025/',  // Replace with your repository name
}

module.exports = nextConfig