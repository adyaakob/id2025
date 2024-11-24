import { NextRequest, NextResponse } from 'next/server';
import { BusinessCard } from '@/types/business-card';
import { readCards, addCard, updateCard, deleteCard } from '@/lib/server/csv-utils';

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const cards = await readCards();
    return NextResponse.json({ cards }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error reading business cards:', error);
    return NextResponse.json(
      { error: 'Failed to read business cards', details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const card = await request.json();
    const savedCard = await addCard(card as Omit<BusinessCard, 'id' | 'processedDate'>);
    return NextResponse.json({ card: savedCard }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error saving business card:', error);
    return NextResponse.json(
      { error: 'Failed to save business card', details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const card = await request.json();
    if (!card.id) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }
    const updatedCard = await updateCard(card as BusinessCard);
    return NextResponse.json({ card: updatedCard }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating business card:', error);
    return NextResponse.json(
      { error: 'Failed to update business card', details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }
    await deleteCard(id);
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting business card:', error);
    return NextResponse.json(
      { error: 'Failed to delete business card', details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}
