import fs from 'fs';
import path from 'path';

interface KnowledgeBaseEntry {
    id: string;
    content: string;
    tags: string[];
}

interface SearchResult {
    id: string;
    match: string;
    score: number;
}

// Load the knowledge base from JSON file
export async function loadKnowledgeBase(): Promise<KnowledgeBaseEntry[]> {
    try {
        const kbPath = path.join(process.cwd(), 'data', 'knowledge-base.json');
        if (!fs.existsSync(kbPath)) {
            // Create an empty knowledge base if it doesn't exist
            const emptyKB: KnowledgeBaseEntry[] = [];
            fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
            fs.writeFileSync(kbPath, JSON.stringify(emptyKB, null, 2));
            return emptyKB;
        }
        const data = fs.readFileSync(kbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading knowledge base:', error);
        return [];
    }
}

// Simple search function using text matching and tag relevance
export async function searchKnowledgeBase(query: string) {
    try {
        // Load all knowledge base files
        const specifications = await import('../../../knowledge_base/specifications.json');
        const productInfo = await import('../../../knowledge_base/product_info.json');
        const features = await import('../../../knowledge_base/features.json');
        const troubleshooting = await import('../../../knowledge_base/troubleshooting.json');
        const support = await import('../../../knowledge_base/support.json');
        const companyProfile = await import('../../../knowledge_base/company-profile.json');
        const productBrochure = await import('../../../knowledge_base/product-brochure.json');

        // Convert JSON objects into searchable arrays
        const searchableContent = [
            // Product specs
            ...Object.entries(specifications).map(([key, value]) => ({
                type: 'specification',
                key,
                value: JSON.stringify(value)
            })),
            // Product info
            ...Object.entries(productInfo).map(([key, value]) => ({
                type: 'product_info',
                key,
                value: value
            })),
            // Features
            ...Object.entries(features).map(([key, value]) => ({
                type: 'feature',
                key,
                value: JSON.stringify(value)
            })),
            // Troubleshooting
            ...troubleshooting.common_issues.map(issue => ({
                type: 'troubleshooting',
                key: issue.problem,
                value: JSON.stringify(issue)
            })),
            // Support info
            ...Object.entries(support).map(([key, value]) => ({
                type: 'support',
                key,
                value: JSON.stringify(value)
            })),
            // PDF content
            ...companyProfile.sections.map(section => ({
                type: 'company_profile',
                key: section.title,
                value: section.content
            })),
            ...productBrochure.sections.map(section => ({
                type: 'product_brochure',
                key: section.title,
                value: section.content
            }))
        ];

        // Perform search
        const results = searchableContent.filter(item => {
            const searchText = `${item.key} ${item.value}`.toLowerCase();
            return query.toLowerCase().split(' ').every(term => 
                searchText.includes(term)
            );
        });

        return results;
    } catch (error) {
        console.error('Knowledge base search error:', error);
        return [];
    }
}

// Add new entry to knowledge base
export async function addToKnowledgeBase(entry: KnowledgeBaseEntry): Promise<void> {
    const kb = await loadKnowledgeBase();
    kb.push(entry);
    
    const kbPath = path.join(process.cwd(), 'data', 'knowledge-base.json');
    fs.writeFileSync(kbPath, JSON.stringify(kb, null, 2));
}
