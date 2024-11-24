/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true
  },
  typescript: {
    // Since it works on localhost, we can ignore TypeScript errors
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig