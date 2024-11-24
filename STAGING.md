# Staging Environment Setup

This document outlines the setup and usage of the staging environment.

## Overview

The staging environment is a pre-production environment that mirrors the production setup. It's used for testing changes before they go live.

## Branch Strategy

- `main` - Production branch
- `staging` - Staging environment branch
- `develop` - Development branch
- Feature branches should be created from `develop`

## Deployment Flow

1. Development:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature
   # Make changes
   git commit -m "Your changes"
   git push origin feature/your-feature
   ```

2. Testing in Staging:
   ```bash
   # Create PR from feature branch to develop
   # Once approved, merge to develop
   # Create PR from develop to staging
   # Automated deployment will start when merged to staging
   ```

3. Production:
   ```bash
   # Create PR from staging to main
   # Once approved and tested in staging, merge to main
   ```

## Environment Variables

Create a `.env.staging` file with the following variables:
```env
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=staging
```

## Local Testing

To test staging environment locally:
```bash
npm run build:staging
npm run start:staging
```

## Automated Deployment

The staging environment is automatically deployed via GitHub Actions when changes are pushed to the `staging` branch.

## Monitoring

- Staging environment logs are available in the deployment platform
- Monitor staging environment at: https://staging.yourdomain.com
- Report any issues in GitHub issues with the "staging" label

## Rolling Back

To rollback staging:
1. Revert the problematic commit
2. Push to staging branch
3. Automated deployment will handle the rest

## Best Practices

1. Always test changes in staging before deploying to production
2. Keep staging as close to production as possible
3. Regular cleanup of staging data
4. Document all configuration differences between staging and production
