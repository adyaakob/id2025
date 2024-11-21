import { encode } from 'html-entities';

interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    source: string;
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
    try {
        // Add VRG-specific terms to the query
        const enhancedQuery = `${query} VRG VoIP Radio Gateway`;
        const encodedQuery = encode(enhancedQuery);
        
        // Use DuckDuckGo's HTML API
        const response = await fetch(
            `https://html.duckduckgo.com/html/?q=${encodedQuery}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }
        );

        const html = await response.text();
        
        // Extract search results using regex
        const results: SearchResult[] = [];
        const resultRegex = /<div class="result__body">.*?<a class="result__a" href="(.*?)".*?>(.*?)<\/a>.*?<a class="result__snippet".*?>(.*?)<\/a>/gs;
        
        let match;
        while ((match = resultRegex.exec(html)) !== null && results.length < 5) {
            const [_, link, title, snippet] = match;
            
            // Skip if the result doesn't seem relevant to VRG
            if (!isRelevantResult(title, snippet)) {
                continue;
            }
            
            results.push({
                title: cleanText(title),
                link: link,
                snippet: cleanText(snippet),
                source: extractDomain(link)
            });
        }
        
        return results;
    } catch (error) {
        console.error('Error searching web:', error);
        return [];
    }
}

function isRelevantResult(title: string, snippet: string): boolean {
    const content = (title + ' ' + snippet).toLowerCase();
    const relevantTerms = ['vrg', 'voip', 'radio', 'gateway', 'ptt', 'radio gateway'];
    
    // Check if at least one relevant term is present
    return relevantTerms.some(term => content.includes(term));
}

function cleanText(text: string): string {
    return text
        .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')        // Replace &nbsp; with space
        .replace(/\s+/g, ' ')           // Normalize whitespace
        .trim();
}

function extractDomain(url: string): string {
    try {
        const domain = new URL(url).hostname;
        return domain.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export async function fetchPageContent(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        // Extract main content (simple approach)
        const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || '';
        
        // Remove scripts, styles, and HTML tags
        return bodyContent
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    } catch (error) {
        console.error('Error fetching page content:', error);
        return '';
    }
}
