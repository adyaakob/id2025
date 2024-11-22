import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storage } from '@/lib/storage';

interface BusinessCard {
  id: string;
  processedDate: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  type: 'customer' | 'partner';
}

export async function GET() {
  try {
    // Use localStorage when on GitHub Pages (static export)
    if (process.env.NODE_ENV === 'production') {
      const cards = await storage.getCards();
      return NextResponse.json({ cards });
    }

    // Return mock data for local development
    return NextResponse.json({
      cards: [
        {
          id: '1',
          processedDate: new Date().toISOString(),
          name: 'John Doe',
          title: 'CEO',
          company: 'Example Corp',
          email: 'john@example.com',
          phone: '+1234567890',
          type: 'customer'
        }
      ]
    });
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
    const card = await request.json();
    
    // Validate card data
    if (!card || typeof card !== 'object') {
      console.error('Invalid card data received:', card);
      return NextResponse.json(
        { error: 'Invalid card data', details: 'Card data must be an object' },
        { status: 400 }
      );
    }

    // Create new card with ID and timestamp
    const newCard: BusinessCard = {
      ...card,
      id: crypto.randomUUID(),
      processedDate: new Date().toISOString()
    };
    
    // Use localStorage when on GitHub Pages (static export)
    if (process.env.NODE_ENV === 'production') {
      const savedCard = await storage.saveCard(newCard);
      return NextResponse.json({ success: true, card: savedCard });
    }
    
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
