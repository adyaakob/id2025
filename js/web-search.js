class WebSearchManager {
    constructor() {
        // You'll need to replace these with your actual API keys
        this.searchConfig = {
            // Google Custom Search API configuration
            googleApiKey: 'YOUR_GOOGLE_API_KEY',
            searchEngineId: 'YOUR_SEARCH_ENGINE_ID',
            
            // Alternative: SerpAPI configuration
            serpApiKey: 'YOUR_SERP_API_KEY',
            
            // Rate limiting
            maxRequestsPerMinute: 10,
            requestCount: 0,
            lastRequestTime: null
        };
    }

    async searchCompetitors(query) {
        try {
            // Rate limiting check
            if (!this.canMakeRequest()) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }

            // Add competitive analysis keywords to the search
            const enhancedQuery = `${query} competitor comparison review`;
            const searchResults = await this.performSearch(enhancedQuery);
            
            return this.formatCompetitorResults(searchResults);
        } catch (error) {
            console.error('Search error:', error);
            return {
                error: true,
                message: 'Unable to perform competitor search at this time.'
            };
        }
    }

    async performSearch(query) {
        // Using Google Custom Search API
        const url = `https://www.googleapis.com/customsearch/v1?key=${this.searchConfig.googleApiKey}&cx=${this.searchConfig.searchEngineId}&q=${encodeURIComponent(query)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Search API request failed');
        }

        this.updateRequestCount();
        return await response.json();
    }

    formatCompetitorResults(results) {
        if (!results.items || results.items.length === 0) {
            return {
                error: true,
                message: 'No competitor information found.'
            };
        }

        // Process and filter relevant results
        const competitors = results.items
            .slice(0, 5) // Limit to top 5 results
            .map(item => ({
                title: item.title,
                snippet: item.snippet,
                link: item.link,
                source: new URL(item.link).hostname
            }));

        return {
            error: false,
            competitors,
            timestamp: new Date().toISOString()
        };
    }

    canMakeRequest() {
        const now = Date.now();
        const oneMinute = 60 * 1000;

        if (!this.searchConfig.lastRequestTime) {
            this.searchConfig.lastRequestTime = now;
            this.searchConfig.requestCount = 0;
            return true;
        }

        if (now - this.searchConfig.lastRequestTime > oneMinute) {
            this.searchConfig.lastRequestTime = now;
            this.searchConfig.requestCount = 0;
            return true;
        }

        return this.searchConfig.requestCount < this.searchConfig.maxRequestsPerMinute;
    }

    updateRequestCount() {
        this.searchConfig.requestCount++;
        this.searchConfig.lastRequestTime = Date.now();
    }
}

// Export for use in chatbot
export default WebSearchManager;
