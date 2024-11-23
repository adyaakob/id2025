// Base configuration
export const BASE_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || ''
} as const;

// GitHub configuration
export const GITHUB_CONFIG = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  GIST_ID: process.env.NEXT_PUBLIC_GIST_ID || ''
} as const;

// Validate configuration
const validateConfig = () => {
  const { API_BASE_URL } = BASE_CONFIG;
  const { GITHUB_TOKEN, GIST_ID } = GITHUB_CONFIG;
  
  if (!API_BASE_URL) {
    console.warn('API base URL is not configured, some features might not work properly');
  }
  
  if (!GITHUB_TOKEN) {
    console.warn('GitHub token is not configured, some features might not work properly');
  }
  
  if (!GIST_ID) {
    console.warn('Gist ID is not configured, some features might not work properly');
  }
};

validateConfig();
