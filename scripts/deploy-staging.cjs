const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute shell commands
const exec = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    process.exit(1);
  }
};

// Function to safely remove directory
const removeDirectory = async (dirPath) => {
  try {
    if (fs.existsSync(dirPath)) {
      const rimraf = require('rimraf');
      await new Promise((resolve, reject) => {
        rimraf(dirPath, { maxRetries: 3, recursive: true }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  } catch (error) {
    console.warn(`Warning: Could not remove directory ${dirPath}:`, error);
    // Continue despite error
  }
};

// Deploy to staging
const deployToStaging = async () => {
  try {
    console.log('🚀 Starting staging deployment process...');
    
    // Clean build directories
    console.log('Cleaning build directories...');
    await removeDirectory(path.join(process.cwd(), '.next'));
    await removeDirectory(path.join(process.cwd(), 'out'));
    
    // Install dependencies
    console.log('Installing dependencies...');
    exec('npm install --no-audit');
    
    // Build with staging environment
    console.log('Building for staging...');
    exec('npm run build:staging');
    
    console.log('✅ Build completed successfully!');
    
    // Start the application
    console.log('Starting application...');
    exec('npm run start:staging');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
};

deployToStaging().catch(console.error);
