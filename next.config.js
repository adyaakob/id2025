/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Always use static export
  basePath: process.env.NODE_ENV === 'production' ? '/id2025' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/id2025/' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Disable server API routes in production
  rewrites: async () => {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ];
    }
    return [];
  },
}

module.exports = nextConfig