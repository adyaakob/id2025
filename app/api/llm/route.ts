import { NextResponse } from 'next/server';
import { searchWeb } from '../search/utils';

// Function to query Ollama
async function queryOllama(prompt: string) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama2",
                prompt: prompt,
                stream: false
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to query Ollama');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error querying Ollama:', error);
        return null;
    }
}

// Technical definitions for radio and military standards
const technicalTerms = {
    'hf': {
        name: 'HF (High Frequency)',
        description: 'Radio frequencies between 3-30 MHz, capable of long-distance communication via ionospheric reflection.'
    },
    'vhf': {
        name: 'VHF (Very High Frequency)',
        description: 'Radio frequencies between 30-300 MHz, used for line-of-sight communication.'
    },
    'uhf': {
        name: 'UHF (Ultra High Frequency)',
        description: 'Radio frequencies between 300 MHz-3 GHz, used for short-range, high-bandwidth communication.'
    }
};

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        // First, check if it's a technical term
        const termMatch = Object.entries(technicalTerms).find(([key]) => 
            query.toLowerCase().includes(key.toLowerCase())
        );

        if (termMatch) {
            const [_, termInfo] = termMatch;
            return NextResponse.json({
                response: `${termInfo.name}: ${termInfo.description}`
            });
        }

        // Try Ollama first
        const ollamaResponse = await queryOllama(query);
        if (ollamaResponse) {
            return NextResponse.json({ response: ollamaResponse });
        }

        // Fallback to web search
        const searchResults = await searchWeb(query);
        return NextResponse.json({ 
            response: searchResults.length > 0 
                ? searchResults[0].snippet 
                : "I apologize, but I couldn't find specific information about that. Could you please rephrase your question?"
        });

    } catch (error) {
        console.error('Error in LLM route:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
