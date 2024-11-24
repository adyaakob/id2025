const fs = require('fs');
const path = require('path');

function cleanBuildDirectories() {
    const dirsToClean = ['.next', 'out'];
    dirsToClean.forEach(dir => {
        const dirPath = path.join(__dirname, '..', dir);
        if (fs.existsSync(dirPath)) {
            console.log(`Cleaning ${dir} directory...`);
            fs.rmdirSync(dirPath, { recursive: true });
        }
    });
}

function runBuild() {
    try {
        console.log('Starting build process...');
        
        // Clean previous build
        cleanBuildDirectories();
        
        // Run next build
        console.log('Running next build...');
        const execSync = require('child_process').execSync;
        execSync('npm run build', { stdio: 'inherit' });
        
        // Ensure the out directory exists
        const outDir = path.join(__dirname, '..', 'out');
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        // Create .nojekyll file
        const nojekyllPath = path.join(outDir, '.nojekyll');
        fs.writeFileSync(nojekyllPath, '');
        
        console.log('Build script completed successfully!');
    } catch (error) {
        console.error('Build failed:', error.message);
        process.exit(1);
    }
}

runBuild();
