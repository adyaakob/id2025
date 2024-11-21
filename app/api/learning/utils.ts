import fs from 'fs';
import path from 'path';
import { kbPath } from '../knowledge-base/utils';
import { searchWeb, fetchPageContent } from '../search/utils';

interface LearningEntry {
    source: string;
    content: string;
    confidence: number;
    timestamp: string;
    verified: boolean;
}

interface KnowledgeEntry {
    id: string;
    content: string;
    tags: string[];
}

export const learningPath = path.join(process.cwd(), 'data', 'learning-queue.json');

// Initialize learning queue if it doesn't exist
if (!fs.existsSync(learningPath)) {
    fs.writeFileSync(learningPath, JSON.stringify([], null, 2));
}

export async function addLearningEntry(entry: LearningEntry) {
    const queue = JSON.parse(fs.readFileSync(learningPath, 'utf-8'));
    queue.push(entry);
    fs.writeFileSync(learningPath, JSON.stringify(queue, null, 2));
}

export async function learnFromWeb(query: string) {
    try {
        // Search the web
        const searchResults = await searchWeb(query);
        
        // Process each search result
        for (const result of searchResults) {
            // Extract content from the page
            const pageContent = await fetchPageContent(result.link);
            
            // Add to learning queue with moderate confidence
            await addLearningEntry({
                source: `web:${result.source}`,
                content: `${result.title}\n${result.snippet}\n\nFull content:\n${pageContent}`,
                confidence: 0.6,  // Moderate confidence for web content
                timestamp: new Date().toISOString(),
                verified: false
            });
        }
    } catch (error) {
        console.error('Error learning from web:', error);
    }
}

export async function processLearningQueue(confidenceThreshold: number = 0.8) {
    const queue = JSON.parse(fs.readFileSync(learningPath, 'utf-8'));
    const kb = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
    
    // Process verified entries or high-confidence entries
    const toProcess = queue.filter((entry: LearningEntry) => {
        // Lower threshold for web-sourced content that has been cross-validated
        const isWebSource = entry.source.startsWith('web:');
        const crossValidated = queue.some(e => 
            e !== entry && 
            areEntriesRelated(e, entry) && 
            e.source !== entry.source
        );
        
        return entry.verified || 
               entry.confidence >= confidenceThreshold ||
               (isWebSource && crossValidated && entry.confidence >= 0.6);
    });
    
    // Group related information
    const groupedEntries = groupRelatedEntries(toProcess);
    
    // Update knowledge base with new entries
    for (const group of groupedEntries) {
        const newEntry: KnowledgeEntry = {
            id: generateId(group),
            content: consolidateContent(group),
            tags: extractTags(group)
        };
        
        // Update existing entry or add new one
        const existingIndex = kb.findIndex((entry: KnowledgeEntry) => entry.id === newEntry.id);
        if (existingIndex >= 0) {
            kb[existingIndex] = mergeEntries(kb[existingIndex], newEntry);
        } else {
            kb.push(newEntry);
        }
    }
    
    // Update knowledge base file
    fs.writeFileSync(kbPath, JSON.stringify(kb, null, 2));
    
    // Remove processed entries from queue
    const remainingEntries = queue.filter((entry: LearningEntry) => 
        !toProcess.includes(entry)
    );
    fs.writeFileSync(learningPath, JSON.stringify(remainingEntries, null, 2));
}

function groupRelatedEntries(entries: LearningEntry[]): LearningEntry[][] {
    // Simple grouping based on content similarity
    const groups: LearningEntry[][] = [];
    
    for (const entry of entries) {
        let added = false;
        for (const group of groups) {
            if (areEntriesRelated(entry, group[0])) {
                group.push(entry);
                added = true;
                break;
            }
        }
        if (!added) {
            groups.push([entry]);
        }
    }
    
    return groups;
}

function areEntriesRelated(entry1: LearningEntry, entry2: LearningEntry): boolean {
    // Simple content similarity check
    const words1 = new Set(entry1.content.toLowerCase().split(/\W+/));
    const words2 = new Set(entry2.content.toLowerCase().split(/\W+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size > 0.3; // 30% similarity threshold
}

function generateId(group: LearningEntry[]): string {
    // Generate ID based on common topics
    const commonWords = extractCommonWords(group.map(e => e.content));
    return `vrg-${commonWords.slice(0, 2).join('-')}`;
}

function extractCommonWords(contents: string[]): string[] {
    const wordCounts = new Map<string, number>();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    
    contents.forEach(content => {
        const words = content.toLowerCase().split(/\W+/);
        words.forEach(word => {
            if (!stopWords.has(word) && word.length > 2) {
                wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
            }
        });
    });
    
    return Array.from(wordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([word]) => word);
}

function consolidateContent(group: LearningEntry[]): string {
    // Combine related information into a coherent content
    const verifiedEntries = group.filter(e => e.verified);
    if (verifiedEntries.length > 0) {
        return verifiedEntries[0].content; // Use the first verified entry
    }
    
    // If no verified entries, use the highest confidence entry
    return group.reduce((prev, curr) => 
        curr.confidence > prev.confidence ? curr : prev
    ).content;
}

function extractTags(group: LearningEntry[]): string[] {
    const tags = new Set<string>();
    const contents = group.map(e => e.content.toLowerCase());
    
    // Add common category tags
    const categories = ['technical', 'features', 'installation', 'troubleshooting', 'specifications'];
    categories.forEach(category => {
        if (contents.some(content => content.includes(category))) {
            tags.add(category);
        }
    });
    
    // Add specific feature tags
    const features = ['voip', 'radio', 'codec', 'ptt', 'interface'];
    features.forEach(feature => {
        if (contents.some(content => content.includes(feature))) {
            tags.add(feature);
        }
    });
    
    return Array.from(tags);
}

function mergeEntries(existing: KnowledgeEntry, newEntry: KnowledgeEntry): KnowledgeEntry {
    return {
        ...existing,
        content: newEntry.content, // Use new content
        tags: Array.from(new Set([...existing.tags, ...newEntry.tags])) // Merge tags
    };
}
