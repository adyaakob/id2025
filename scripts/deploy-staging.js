const { execSync } = require('child_process');

// Function to execute shell commands
const exec = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    process.exit(1);
  }
};

// Deploy to staging
const deployToStaging = () => {
  console.log('🚀 Deploying to staging...');
  
  // Build with staging environment
  exec('npm run build');
  
  // Add your deployment commands here
  // For example, if using Vercel:
  // exec('vercel --prod');
  
  console.log('✅ Deployment to staging complete!');
};

deployToStaging();
