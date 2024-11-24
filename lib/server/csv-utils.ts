import fs from 'fs';
import path from 'path';
import { BusinessCard } from '@/types/business-card';
import crypto from 'crypto';

const CSV_FILE_PATH = path.join(process.cwd(), 'data', 'business-cards.csv');
console.log('CSV file path:', CSV_FILE_PATH);

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
console.log('Data directory:', dataDir);

if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create CSV file if it doesn't exist
if (!fs.existsSync(CSV_FILE_PATH)) {
  console.log('Creating CSV file...');
  fs.writeFileSync(CSV_FILE_PATH, 'id,name,title,company,email,phone,type,processedDate\n');
} else {
  console.log('CSV file exists');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        currentValue += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue);
  return values;
}

export async function readCards(): Promise<BusinessCard[]> {
  console.log('Reading cards from:', CSV_FILE_PATH);
  try {
    const content = await fs.promises.readFile(CSV_FILE_PATH, 'utf-8');
    console.log('File content length:', content.length);
    const lines = content.trim().split('\n');
    console.log('Number of lines:', lines.length);
    const headers = lines[0].split(',');
    console.log('Headers:', headers);
    
    return lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const card: any = {};
      headers.forEach((header, index) => {
        card[header.trim()] = values[index]?.trim() || '';
      });
      return card as BusinessCard;
    });
  } catch (error) {
    console.error('Error reading cards:', error);
    throw error;
  }
}

export async function writeCards(cards: BusinessCard[]): Promise<void> {
  const headers = ['id', 'name', 'title', 'company', 'email', 'phone', 'type', 'processedDate'];
  const content = [
    headers.join(','),
    ...cards.map(card => 
      headers.map(header => escapeCSV(String(card[header as keyof BusinessCard] || ''))).join(',')
    )
  ].join('\n');
  
  await fs.promises.writeFile(CSV_FILE_PATH, content);
}

export async function addCard(card: BusinessCard): Promise<BusinessCard> {
  const cards = await readCards();
  const newCard = {
    ...card,
    id: crypto.randomUUID(),
    processedDate: new Date().toISOString()
  };
  cards.push(newCard);
  await writeCards(cards);
  return newCard;
}

export async function updateCard(updatedCard: BusinessCard): Promise<BusinessCard> {
  const cards = await readCards();
  const index = cards.findIndex(card => card.id === updatedCard.id);
  if (index === -1) {
    throw new Error('Card not found');
  }
  cards[index] = {
    ...updatedCard,
    processedDate: cards[index].processedDate
  };
  await writeCards(cards);
  return cards[index];
}

export async function deleteCard(id: string): Promise<void> {
  const cards = await readCards();
  const filteredCards = cards.filter(card => card.id !== id);
  await writeCards(filteredCards);
}
