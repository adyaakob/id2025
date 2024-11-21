/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/id2025' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/id2025/' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Disable API routes in static export
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: '/_404', // This will show a 404 for API routes in static export
        },
      ],
    }
  },
}

module.exports = nextConfig