import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

interface BusinessCard {
  id: string;
  processedDate: string;
  [key: string]: any;
}

interface CardData {
  cards: BusinessCard[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'business-cards.json');

console.log('API Route Configuration:', {
  DATA_DIR,
  DATA_FILE,
  exists: {
    DATA_DIR: existsSync(DATA_DIR),
    DATA_FILE: existsSync(DATA_FILE)
  }
});

// Initialize data directory and file
try {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
    console.log('Created data directory:', DATA_DIR);
  }
  
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify({ cards: [] }), 'utf-8');
    console.log('Initialized empty data file:', DATA_FILE);
  }
} catch (error) {
  console.error('Error initializing data storage:', error);
}

export async function GET() {
  try {
    if (!existsSync(DATA_FILE)) {
      return NextResponse.json({ cards: [] });
    }

    const fileContent = readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(fileContent) as CardData;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading business cards:', error);
    return NextResponse.json(
      { error: 'Failed to read business cards', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    const card = await request.json();
    
    // Validate card data
    if (!card || typeof card !== 'object') {
      console.error('Invalid card data received:', card);
      return NextResponse.json(
        { error: 'Invalid card data', details: 'Card data must be an object' },
        { status: 400 }
      );
    }

    // Initialize data structure
    let data: CardData = { cards: [] };
    
    if (existsSync(DATA_FILE)) {
      const fileContent = readFileSync(DATA_FILE, 'utf-8');
      try {
        data = JSON.parse(fileContent) as CardData;
      } catch (error) {
        console.error('Error parsing existing data, starting fresh:', error);
      }
    }
    
    // Add new card
    const newCard: BusinessCard = {
      ...card,
      id: crypto.randomUUID(),
      processedDate: new Date().toISOString()
    };
    
    data.cards.push(newCard);
    
    // Save to file
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, card: newCard });
  } catch (error) {
    console.error('Error processing business card:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save business card', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
