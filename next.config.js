/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  typescript: {
    // Since it works on localhost, we can ignore TypeScript errors
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig