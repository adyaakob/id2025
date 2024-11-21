import { NextResponse } from 'next/server';
import { searchKnowledgeBase } from '../knowledge-base/utils';
import { addLearningEntry, learnFromWeb } from '../learning/utils';
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
            throw new Error(`HTTP error! status: ${response.status}`);
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
        description: 'Radio frequencies in the range of 3-30 MHz. HF waves can travel long distances by bouncing off the ionosphere, making them useful for long-range communication, international broadcasting, and maritime/aviation communications.',
        characteristics: ['Long-distance propagation', 'Affected by ionospheric conditions', 'Used in global communications']
    },
    'vhf': {
        name: 'VHF (Very High Frequency)',
        description: 'Radio frequencies in the range of 30-300 MHz. VHF waves generally travel in line of sight and are less affected by atmospheric noise, making them ideal for FM radio, television broadcasting, and short to medium-range land mobile communications.',
        characteristics: ['Line-of-sight propagation', 'Less atmospheric noise', 'Good for local communications']
    },
    'mil-std-461': {
        name: 'MIL-STD-461',
        description: 'A United States Military Standard that addresses electromagnetic interference (EMI) characteristics of electronic equipment. It establishes interface and associated verification requirements for the control of electromagnetic interference characteristics of electronic equipment and subsystems.',
        currentVersion: 'MIL-STD-461G (2015)',
        keyAspects: [
            'EMI emissions limits',
            'EMI susceptibility requirements',
            'Test procedures and methodologies',
            'Equipment categories and applications'
        ],
        purposes: [
            'Ensure equipment operates without degradation in intended electromagnetic environment',
            'Prevent interference with other equipment',
            'Control both radiated and conducted emissions',
            'Verify electromagnetic compatibility (EMC)'
        ],
        applications: [
            'Military equipment and systems',
            'Aircraft and aerospace systems',
            'Ground-based equipment',
            'Maritime systems'
        ]
    }
};

// Technical definitions and product information
const productInfo = {
    'ports': {
        title: 'VRG Ports',
        content: 'The VRG features:\n• 4 Audio Ports: For connecting HF, VHF, and UHF radios and mobile communication terminals\n• 2 Ethernet Ports: Configured as a 2-port switch for network connectivity\n• Total: 6 physical ports'
    },
    'overview': {
        title: 'VRG Overview',
        content: 'The VoIP Radio Gateway (VRG) is a professional device that:\n• Integrates non-IP legacy radios into IP-based networks\n• Connects multi-party calls among HF, VHF, and UHF networks\n• Supports dedicated mobile communication terminals\n• Features 4 audio ports and 2 Ethernet ports\n• Enables seamless communication between legacy radio systems and modern IP networks\n• Converts analog radio signals to digital and vice versa'
    }
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query } = body;
        
        // Convert query to lowercase for case-insensitive matching
        const lowerQuery = query.toLowerCase();
        
        // Check for specific product information queries
        if (lowerQuery.includes('port')) {
            return NextResponse.json({ response: productInfo.ports.content });
        }
        
        if (lowerQuery.includes('overview') || lowerQuery === 'what is vrg' || lowerQuery.includes('about this product')) {
            return NextResponse.json({ response: productInfo.overview.content });
        }
        
        // Check for technical term queries
        if (lowerQuery.includes('mil-std-461') || lowerQuery.includes('mil std 461')) {
            const milStd = technicalTerms['mil-std-461'];
            let response = `${milStd.name}:\n\n`;
            response += `${milStd.description}\n\n`;
            response += `Current Version: ${milStd.currentVersion}\n\n`;
            
            response += `Key Aspects:\n`;
            milStd.keyAspects.forEach(aspect => {
                response += `• ${aspect}\n`;
            });
            response += '\n';
            
            response += `Main Purposes:\n`;
            milStd.purposes.forEach(purpose => {
                response += `• ${purpose}\n`;
            });
            response += '\n';
            
            response += `Applications:\n`;
            milStd.applications.forEach(app => {
                response += `• ${app}\n`;
            });
            
            return NextResponse.json({ response });
        }
        
        // Handle HF/VHF queries
        if (lowerQuery.includes('hf') || lowerQuery.includes('vhf')) {
            let response = '';
            
            // Check if asking about both HF and VHF
            if (lowerQuery.includes('hf') && lowerQuery.includes('vhf')) {
                response = `Let me explain the difference between HF and VHF:\n\n`;
                response += `1. ${technicalTerms.hf.name}:\n`;
                response += `${technicalTerms.hf.description}\n\n`;
                response += `2. ${technicalTerms.vhf.name}:\n`;
                response += `${technicalTerms.vhf.description}\n\n`;
                response += `Key differences:\n`;
                response += `- HF is better for long-distance communication due to ionospheric propagation\n`;
                response += `- VHF is better for local, line-of-sight communication with less interference\n`;
                response += `- HF operates at lower frequencies (3-30 MHz) while VHF operates at higher frequencies (30-300 MHz)`;
            }
            else if (lowerQuery.includes('hf')) {
                response = `${technicalTerms.hf.name}:\n${technicalTerms.hf.description}`;
            }
            else if (lowerQuery.includes('vhf')) {
                response = `${technicalTerms.vhf.name}:\n${technicalTerms.vhf.description}`;
            }
            
            return NextResponse.json({ response });
        }
        
        // If not a specific query, search knowledge base
        const kbResults = await searchKnowledgeBase(query);
        let response = '';
        
        if (kbResults && kbResults.length > 0) {
            // Find most relevant entry based on query
            const relevantEntry = kbResults.find(entry => {
                const content = (entry.value && typeof entry.value === 'string' ? entry.value : 
                               typeof entry.value === 'object' ? JSON.stringify(entry.value) : '')
                               .toLowerCase();
                return content.includes(lowerQuery) || 
                       (entry.key && entry.key.toLowerCase().includes(lowerQuery));
            }) || kbResults[0];
            
            response = typeof relevantEntry.value === 'string' ? relevantEntry.value :
                      typeof relevantEntry.value === 'object' ? JSON.stringify(relevantEntry.value, null, 2) :
                      'No relevant information found';
        } else {
            // Try web search for VRG-specific information
            console.log('Searching web for VRG-specific information...');
            const webResults = await searchWeb(query);
            
            // If it's a general technical question, use Ollama
            const prompt = `You are a technical expert. Please explain in clear, concise terms: ${query}`;
            const llmResponse = await queryOllama(prompt);
            
            if (webResults.length > 0) {
                // Format web results
                response = "Based on web search results:\n\n";
                webResults.forEach(result => {
                    response += `From ${result.source}:\n${result.snippet}\n\n`;
                });
                
                // Add LLM explanation if available
                if (llmResponse) {
                    response += "\nGeneral explanation:\n" + llmResponse;
                }
                
                // Add disclaimer
                response += "\n\nPlease note: Web search results may need verification.";
                
                // Learn from web results asynchronously
                learnFromWeb(query).catch(console.error);
            } else if (llmResponse) {
                // Use LLM response if no web results but LLM has an answer
                response = llmResponse;
            } else {
                response = "I apologize, but I don't have enough information to answer that question accurately. This query has been added to our learning queue for future improvements.";
            }
            
            // Add unanswered query to learning queue
            await addLearningEntry({
                source: 'unanswered-query',
                content: query,
                confidence: 0.3,
                timestamp: new Date().toISOString(),
                verified: false
            });
        }
        
        return NextResponse.json({ response });
    } catch (error) {
        console.error('Error in LLM endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
