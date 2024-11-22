/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/id2025' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/id2025/' : '',
  images: {
    unoptimized: true,
    domains: ['unpkg.com'],
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
}

module.exports = nextConfig