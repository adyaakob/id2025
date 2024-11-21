import { NextResponse } from 'next/server';
import { addLearningEntry, processLearningQueue } from './utils';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { source, content, confidence = 0.5 } = body;

        if (!source || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await addLearningEntry({
            source,
            content,
            confidence,
            timestamp: new Date().toISOString(),
            verified: false
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in learning endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { confidenceThreshold } = body;

        await processLearningQueue(confidenceThreshold);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing learning queue:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
