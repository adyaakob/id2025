module.exports = {
  // Staging-specific configuration
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://id2025.onrender.com',
    NEXT_PUBLIC_ENVIRONMENT: 'staging',
  },
  // Add staging-specific Next.js configuration
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['unpkg.com'],
    unoptimized: true
  }
};
