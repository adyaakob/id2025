import axios from 'axios';

interface SearchResult {
    section: string;
    match: string;
    context?: {
        title?: string;
        pageNumber?: number;
        sectionTitle?: string;
        [key: string]: any;
    };
}

interface SearchResponse {
    results: SearchResult[];
    error?: string;
}

async function testKnowledgeBase() {
    // List of test queries
    const queries = [
        "physical specifications",
        "weight",
        "size",
        "dimensions",
        "material",
        "aluminum"
    ];

    console.log("Testing Knowledge Base Search...\n");

    // First test if the server is running
    try {
        console.log("Testing server connection...");
        await axios.get('http://localhost:3000/');
        console.log("Server is running!\n");
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Failed to connect to server:", error.message);
            if (error.code === 'ECONNREFUSED') {
                console.error("Make sure the Next.js development server is running (npm run dev)");
                return;
            }
        }
        console.error("Unexpected error:", error);
        return;
    }

    for (const query of queries) {
        console.log(`\n=== Testing query: "${query}" ===`);
        
        try {
            const response = await axios.get<SearchResponse>(
                `http://localhost:3000/api/knowledge-base?query=${encodeURIComponent(query)}`
            );
            const data = response.data;

            if (data.results && data.results.length > 0) {
                console.log(`Found ${data.results.length} results:`);
                data.results.forEach((result: SearchResult, index: number) => {
                    console.log(`\n${index + 1}. From ${result.section}:`);
                    console.log("-------------------");
                    console.log(result.match);
                    if (result.context) {
                        console.log("\nContext:");
                        console.log(JSON.stringify(result.context, null, 2));
                    }
                });
            } else {
                console.log("No results found.");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Error testing query "${query}":`, error.message);
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
            } else {
                console.error(`Error testing query "${query}":`, error);
            }
        }
    }
}

console.log("Starting knowledge base test...");
console.log("Make sure your Next.js development server is running (npm run dev)\n");

// Run the test
testKnowledgeBase().catch(console.error);
