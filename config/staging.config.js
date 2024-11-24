module.exports = {
  // Staging-specific configuration
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.yourdomain.com',
    NEXT_PUBLIC_ENVIRONMENT: 'staging',
  },
  // Add other staging-specific settings
  build: {
    sourceMaps: true, // Enable source maps for debugging
  },
  // Add any staging-specific feature flags
  features: {
    debug: true,
    mockServices: false,
    analytics: true,
  }
};
