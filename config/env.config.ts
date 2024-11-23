// GitHub configuration
export const GITHUB_CONFIG = {
  GITHUB_TOKEN: process.env.NEXT_PUBLIC_GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN',
  GIST_ID: process.env.NEXT_PUBLIC_GIST_ID || 'YOUR_GIST_ID'
} as const;

// Validate configuration
const validateConfig = () => {
  const { GITHUB_TOKEN, GIST_ID } = GITHUB_CONFIG;
  
  if (!GITHUB_TOKEN || GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN') {
    console.error('GitHub token is not configured');
  }
  
  if (!GIST_ID || GIST_ID === 'YOUR_GIST_ID') {
    console.error('Gist ID is not configured');
  }
};

// Run validation
validateConfig();
