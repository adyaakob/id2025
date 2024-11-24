import { NextResponse } from 'next/server';
import { writeCards } from '@/lib/server/csv-utils';
import { BusinessCard } from '@/types/business-card';

const sampleCards: BusinessCard[] = [
  {
    id: '885a997f-b8a1-41a0-98e4-1a6219bb5124',
    name: 'John Smith',
    title: 'Senior Developer',
    company: 'Tech Corp',
    email: 'john.smith@techcorp.com',
    phone: '+1-555-123-4567',
    type: 'customer',
    processedDate: '2024-01-20T10:30:00.000Z'
  },
  {
    id: '2b69f41f-19a3-455b-9016-a1e0e35c86a7',
    name: 'Sarah Johnson',
    title: 'Marketing Director',
    company: 'Innovation Labs, Inc',
    email: 'sarah.j@innovation.com',
    phone: '(805) 555-0123',
    type: 'customer',
    processedDate: '2024-01-20T11:45:00.000Z'
  },
  {
    id: 'b5f4310e-744a-4fbe-bfba-fce0c41f4ffc',
    name: 'Michael Chen',
    title: 'Product Manager',
    company: 'Global Solutions',
    email: 'm.chen@globalsolutions.net',
    phone: '+1-555-987-6543',
    type: 'customer',
    processedDate: '2024-01-20T12:15:00.000Z'
  },
  {
    id: 'c7d8e9f0-1234-5678-9abc-def012345678',
    name: 'Emily Wong',
    title: 'CEO',
    company: 'Smart Tech, Ltd.',
    email: 'emily.w@smarttech.io',
    phone: '+44 20 7123 4567',
    type: 'partner',
    processedDate: '2024-01-20T14:20:00.000Z'
  },
  {
    id: 'd8e9f0a1-2345-6789-bcde-f01234567890',
    name: 'Robert Taylor',
    title: 'Sales Director',
    company: 'Business Partners',
    email: 'rob.taylor@bizpartners.com',
    phone: '+1-555-789-0123',
    type: 'partner',
    processedDate: '2024-01-20T15:45:00.000Z'
  }
];

export async function GET() {
  try {
    await writeCards(sampleCards);
    return NextResponse.json({ success: true, message: 'Sample data initialized' });
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return NextResponse.json(
      { error: 'Failed to initialize sample data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
