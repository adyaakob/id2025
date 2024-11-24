module.exports = {
  // Staging-specific configuration
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://id2025.onrender.com',
    NEXT_PUBLIC_ENVIRONMENT: 'staging',
  },
  images: {
    domains: ['unpkg.com'],
    unoptimized: true
  }
};
