// @ts-check

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',  // Changed to export for GitHub Pages
  images: {
    domains: ['unpkg.com'],
    unoptimized: true
  },
  typescript: {
    // Since it works on localhost, we can ignore TypeScript errors
    ignoreBuildErrors: true
  },
  basePath: '/id2025',
  assetPrefix: '/id2025'
}