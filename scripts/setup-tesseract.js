const fs = require('fs');
const path = require('path');
const https = require('https');

const TESSERACT_FILES = {
  'worker.min.js': 'https://unpkg.com/tesseract.js@v4.1.1/dist/worker.min.js',
  'tesseract-core.wasm.js': 'https://unpkg.com/tesseract.js-core@v4.0.4/tesseract-core.wasm.js',
  'eng.traineddata': 'https://tessdata.projectnaptha.com/4.0.0/eng.traineddata'
};

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const TESSERACT_DIR = path.join(PUBLIC_DIR, 'tesseract');
const LANG_DATA_DIR = path.join(TESSERACT_DIR, 'lang-data');

// Create directories if they don't exist
[TESSERACT_DIR, LANG_DATA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Download file helper function
const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

// Download all files
async function setupTesseract() {
  try {
    console.log('Setting up Tesseract files...');
    
    for (const [filename, url] of Object.entries(TESSERACT_FILES)) {
      const dest = filename === 'eng.traineddata' 
        ? path.join(LANG_DATA_DIR, filename)
        : path.join(TESSERACT_DIR, filename);
        
      if (!fs.existsSync(dest)) {
        console.log(`Downloading ${filename}...`);
        await downloadFile(url, dest);
        console.log(`Downloaded ${filename}`);
      } else {
        console.log(`${filename} already exists`);
      }
    }
    
    console.log('Tesseract setup complete!');
  } catch (error) {
    console.error('Error setting up Tesseract:', error);
    process.exit(1);
  }
}

setupTesseract();
