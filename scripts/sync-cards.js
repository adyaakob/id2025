import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const GIST_ID = process.env.NEXT_PUBLIC_GIST_ID;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

if (!GIST_ID || !GITHUB_TOKEN) {
  console.error('Error: NEXT_PUBLIC_GIST_ID and NEXT_PUBLIC_GITHUB_TOKEN must be set in .env.local');
  process.exit(1);
}

// Create a custom HTTPS agent with longer timeout
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  timeout: 30000
});

const api = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 30000,
  httpsAgent,
  headers: {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  }
});

async function getLocalCards() {
  try {
    const localStoragePath = path.join(process.cwd(), 'data', 'cards.json');
    const data = await fs.readFile(localStoragePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local storage:', error);
    return [];
  }
}

async function updateGist() {
  try {
    const cards = await getLocalCards();
    console.log('Syncing cards:', cards);

    const response = await api.patch(`/gists/${GIST_ID}`, {
      files: {
        'business_cards.json': {
          content: JSON.stringify(cards, null, 2)
        }
      }
    });

    console.log('Successfully synced cards to Gist:', response.data.html_url);
    return response.data;
  } catch (error) {
    console.error('Error updating gist:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

updateGist();
