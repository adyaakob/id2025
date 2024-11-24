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
const removeDirectory = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

// Deploy to staging
const deployToStaging = () => {
  console.log('🚀 Starting staging deployment process...');
  
  // Clean build directories
  console.log('Cleaning build directories...');
  removeDirectory(path.join(process.cwd(), '.next'));
  removeDirectory(path.join(process.cwd(), 'out'));
  
  // Install dependencies
  console.log('Installing dependencies...');
  exec('npm install');
  
  // Build with staging environment
  console.log('Building for staging...');
  exec('npm run build:staging');
  
  // Add your deployment commands here
  // For example, if using Vercel:
  // exec('vercel --prod');
  
  console.log('✅ Deployment to staging complete!');
};

deployToStaging();
