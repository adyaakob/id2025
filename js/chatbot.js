import WebSearchManager from './web-search.js';

class Chatbot {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
        
        // Initialize web search
        this.webSearch = new WebSearchManager();
        
        // Knowledge base storage
        this.knowledgeBase = {
            productInfo: null,
            specifications: null,
            features: null,
            support: null,
            troubleshooting: null
        };

        // Keywords for natural language processing
        this.keywords = {
            greetings: ['hello', 'hi', 'hey', 'greetings'],
            specifications: ['specs', 'specifications', 'dimensions', 'weight', 'technical'],
            features: ['feature', 'features', 'capabilities', 'functions', 'what can it do'],
            support: ['help', 'support', 'assistance', 'contact', 'issue', 'problem'],
            troubleshooting: ['problem', 'issue', 'not working', 'error', 'help'],
            warranty: ['warranty', 'guarantee', 'coverage'],
            competitors: ['competitor', 'competition', 'compare', 'alternative', 'versus', 'vs']
        };

        this.loadKnowledgeBase();
        this.initializeEventListeners();
    }

    async loadKnowledgeBase() {
        try {
            // Load all knowledge base files
            const files = [
                'product_info.json',
                'specifications.json',
                'features.json',
                'support.json',
                'troubleshooting.json'
            ];

            const responses = await Promise.all(
                files.map(file => 
                    fetch(`knowledge_base/${file}`)
                    .then(response => response.json())
                )
            );

            [
                this.knowledgeBase.productInfo,
                this.knowledgeBase.specifications,
                this.knowledgeBase.features,
                this.knowledgeBase.support,
                this.knowledgeBase.troubleshooting
            ] = responses;

            console.log('Knowledge base loaded successfully');
        } catch (error) {
            console.error('Error loading knowledge base:', error);
        }
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleUserMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserMessage();
            }
        });
    }

    async handleUserMessage() {
        const message = this.chatInput.value.trim();
        if (message === '') return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.chatInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Check if this is a competitor search request
            if (this.keywords.competitors.some(word => message.toLowerCase().includes(word))) {
                const competitorInfo = await this.webSearch.searchCompetitors(message);
                this.hideTypingIndicator();
                
                if (competitorInfo.error) {
                    this.addMessage(competitorInfo.message, 'bot');
                } else {
                    let response = "Here's what I found about competitors:\n\n";
                    competitorInfo.competitors.forEach(comp => {
                        response += `📊 ${comp.title}\n`;
                        response += `${comp.snippet}\n`;
                        response += `Source: ${comp.source}\n\n`;
                    });
                    response += "Would you like me to analyze any specific aspect of these competitors?";
                    this.addMessage(response, 'bot');
                }
            } else {
                // Regular knowledge base response
                const response = this.generateResponse(message);
                this.hideTypingIndicator();
                this.addMessage(response, 'bot');
            }
        } catch (error) {
            console.error('Error handling message:', error);
            this.hideTypingIndicator();
            this.addMessage("I apologize, but I encountered an error while processing your request. Please try again.", 'bot');
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${content}
                <div class="message-time">${time}</div>
            </div>
        `;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = this.messagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    generateResponse(message) {
        message = message.toLowerCase();

        // Check for greetings
        if (this.keywords.greetings.some(word => message.includes(word))) {
            return `Hello! I'm your product assistant for ${this.knowledgeBase.productInfo.name}. How can I help you today?`;
        }

        // Check for specifications
        if (this.keywords.specifications.some(word => message.includes(word))) {
            const specs = this.knowledgeBase.specifications;
            return `Here are the key specifications of ${this.knowledgeBase.productInfo.name}:\n` +
                   `- Dimensions: ${specs.dimensions.width} x ${specs.dimensions.height} x ${specs.dimensions.depth}\n` +
                   `- Weight: ${specs.weight}\n` +
                   `- Power: ${specs.power.voltage}, ${specs.power.consumption}\n` +
                   `Would you like more detailed technical information?`;
        }

        // Check for features
        if (this.keywords.features.some(word => message.includes(word))) {
            const features = Object.values(this.knowledgeBase.features)
                .map(f => `- ${f.name}: ${f.description}`)
                .join('\n');
            return `Here are the main features:\n${features}`;
        }

        // Check for support
        if (this.keywords.support.some(word => message.includes(word))) {
            const support = this.knowledgeBase.support.contact;
            return `Our support team is here to help:\n` +
                   `- Phone: ${support.phone}\n` +
                   `- Email: ${support.email}\n` +
                   `- Hours: ${support.hours}`;
        }

        // Check for troubleshooting
        if (this.keywords.troubleshooting.some(word => message.includes(word))) {
            return `I can help you troubleshoot common issues. Could you please describe the problem you're experiencing?`;
        }

        // Check for warranty
        if (this.keywords.warranty.some(word => message.includes(word))) {
            const warranty = this.knowledgeBase.support.warranty;
            return `Warranty Information:\n` +
                   `- Duration: ${warranty.duration}\n` +
                   `- Coverage: ${warranty.coverage}`;
        }

        // Default response
        return "I'm not sure about that. Would you like information about our product's features, specifications, support, or troubleshooting?";
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new Chatbot();
});
