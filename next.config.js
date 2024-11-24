// @ts-check

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/id2025' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/id2025' : '',
  trailingSlash: true,
  skipTrailingSlashRedirect: true
}