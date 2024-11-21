import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Function to load knowledge base files
async function loadKnowledgeBase() {
    const kbPath = path.join(process.cwd(), 'knowledge_base');
    const files = [
        'features.json',
        'product_info.json',
        'specifications.json',
        'support.json',
        'troubleshooting.json',
        'product-brochure.json',
        'company-profile.json'
    ];
    const knowledgeBase: { [key: string]: any } = {};

    for (const file of files) {
        const filePath = path.join(kbPath, file);
        try {
            if (fs.existsSync(filePath)) {
                const content = await fs.promises.readFile(filePath, 'utf-8');
                const parsed = JSON.parse(content);
                
                // Handle PDF-sourced content differently
                if (parsed.type === 'pdf') {
                    knowledgeBase[file.replace('.json', '')] = {
                        type: 'pdf',
                        title: parsed.title,
                        sections: parsed.sections.map((section: any) => ({
                            title: section.title,
                            content: section.content,
                            pageNumber: section.pageNumber
                        }))
                    };
                } else {
                    knowledgeBase[file.replace('.json', '')] = parsed;
                }
            }
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    }

    return knowledgeBase;
}

// Function to search through knowledge base
function searchKnowledgeBase(query: string, knowledgeBase: any) {
    query = query.toLowerCase();
    const results: any[] = [];

    // Common variations of physical specifications
    const specVariations: { [key: string]: string[] } = {
        'weight': ['weight', 'mass', 'kg', 'kilograms', 'grams', 'g', 'heavy', 'light'],
        'dimensions': ['dimensions', 'dimension', 'size', 'sizes', 'measurements', 'width', 'height', 'depth', 'length', 'mm', 'cm', 'meter'],
        'material': ['material', 'aluminum', 'aluminium', 'metal', 'plastic', 'chassis', 'build', 'construction'],
        'physical': ['physical', 'specifications', 'specs', 'characteristics', 'properties', 'features']
    };

    // Get all related terms for the query
    const relatedTerms = new Set([query]);
    Object.entries(specVariations).forEach(([category, variations]) => {
        // Check if query contains any variation
        if (variations.some(v => query.includes(v))) {
            // Add the category and all its variations
            relatedTerms.add(category);
            variations.forEach(v => relatedTerms.add(v));
            
            // If searching for dimensions or size, include all dimension-related terms
            if (category === 'dimensions') {
                specVariations['dimensions'].forEach(v => relatedTerms.add(v));
                specVariations['physical'].forEach(v => relatedTerms.add(v));
            }
        }
    });

    // First search specifications.json as it's the primary source
    if (knowledgeBase['specifications']) {
        const specs = knowledgeBase['specifications'];
        Object.entries(specs).forEach(([key, value]) => {
            // Check if the key matches any related terms
            const keyMatches = Array.from(relatedTerms).some(term => key.toLowerCase().includes(term));
            
            // For objects (like dimensions), also check their properties
            const propertyMatches = typeof value === 'object' && 
                Object.keys(value).some(prop => Array.from(relatedTerms).some(term => prop.toLowerCase().includes(term)));

            if (keyMatches || propertyMatches) {
                let formattedValue = '';
                if (typeof value === 'object') {
                    // For dimensions, create a more readable format
                    if (key === 'dimensions') {
                        formattedValue = 'Product Dimensions:\n' + Object.entries(value)
                            .map(([k, v]) => `• ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                            .join('\n');
                    } else {
                        formattedValue = Object.entries(value)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join('\n');
                    }
                } else {
                    formattedValue = value.toString();
                }
                results.push({
                    section: 'specifications',
                    match: `${formattedValue}`,
                    context: { title: 'Product Specifications', key }
                });
            }
        });
    }

    // Then search through each section of the knowledge base
    Object.entries(knowledgeBase).forEach(([section, content]: [string, any]) => {
        if (section !== 'specifications') {  // Skip specifications as we already searched it
            if (content.type === 'pdf') {
                // Search through PDF content
                content.sections.forEach((pdfSection: any) => {
                    const titleLower = pdfSection.title.toLowerCase();
                    const contentLower = pdfSection.content.toLowerCase();
                    
                    // Check if any related terms are found
                    if (Array.from(relatedTerms).some(term => 
                        titleLower.includes(term) || contentLower.includes(term)
                    )) {
                        // Extract the relevant part of the content
                        let match = '';
                        const lines = pdfSection.content.split('\n');
                        for (const line of lines) {
                            if (Array.from(relatedTerms).some(term => 
                                line.toLowerCase().includes(term)
                            )) {
                                match += line + '\n';
                            }
                        }
                        
                        if (match || titleLower.includes(query)) {
                            results.push({
                                section: `${section} (PDF Page ${pdfSection.pageNumber})`,
                                match: match || `${pdfSection.title}\n${pdfSection.content}`,
                                context: {
                                    title: content.title,
                                    pageNumber: pdfSection.pageNumber,
                                    sectionTitle: pdfSection.title
                                }
                            });
                        }
                    }
                });
            } else {
                // Search through regular JSON content
                const sectionResults = searchSection(query, content, section, relatedTerms);
                results.push(...sectionResults);
            }
        }
    });

    return results;
}

function searchSection(query: string, content: any, section: string, relatedTerms: Set<string>) {
    const results: any[] = [];

    function searchValue(key: string, value: any, context: any) {
        if (typeof value === 'string') {
            const valueLower = value.toLowerCase();
            // Check if any related terms are found
            if (Array.from(relatedTerms).some(term => valueLower.includes(term))) {
                results.push({
                    section,
                    match: value,
                    context
                });
            }
        } else if (typeof value === 'object' && value !== null) {
            // Recursively search through nested objects
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                searchValue(nestedKey, nestedValue, {
                    ...context,
                    [key]: value
                });
            });
        }
    }

    // Handle different content structures
    if (Array.isArray(content)) {
        content.forEach(item => {
            if (typeof item === 'object') {
                Object.entries(item).forEach(([key, value]) => {
                    searchValue(key, value, item);
                });
            }
        });
    } else if (typeof content === 'object') {
        Object.entries(content).forEach(([key, value]) => {
            searchValue(key, value, { [key]: value });
        });
    }

    return results;
}

function formatResponse(results: any[]): string {
    // For dimension/size queries, return just the dimensions
    if (results.some(r => r.match.includes('mm') || r.match.includes('kg'))) {
        const dimensions = results.find(r => r.match.includes('mm'))?.match;
        const weight = results.find(r => r.match.includes('kg'))?.match;
        
        if (dimensions || weight) {
            // Return only the specific measurement asked for
            if (dimensions && !weight) return dimensions.trim();
            if (weight && !dimensions) return weight.trim().split('\n')[0];
            return `${dimensions}\n\n${weight.trim().split('\n')[0]}`;
        }
    }
    
    // For other queries, return just the most relevant match
    return results[0]?.match.trim() || 'I could not find information about that.';
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const knowledgeBase = await loadKnowledgeBase();
        const results = searchKnowledgeBase(query, knowledgeBase);
        const formattedResponse = formatResponse(results);
        
        return NextResponse.json({ results: [{ match: formattedResponse }] });
    } catch (error) {
        console.error('Error processing knowledge base query:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
