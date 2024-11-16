// Main application class
class App {
    constructor() {
        this.initializeApp();
        this.setupEventListeners();
    }

    initializeApp() {
        // Check if running in offline mode
        this.isOffline = !navigator.onLine;
        this.updateOnlineStatus();

        // Initialize fullscreen mode for exhibition display
        this.setupFullscreen();
    }

    setupEventListeners() {
        // Monitor online/offline status
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    updateOnlineStatus() {
        this.isOffline = !navigator.onLine;
        
        // Update UI elements based on connection status
        const chatbotContainer = document.querySelector('.chatbot-container');
        if (this.isOffline) {
            chatbotContainer.classList.add('offline-mode');
        } else {
            chatbotContainer.classList.remove('offline-mode');
        }
    }

    setupFullscreen() {
        document.documentElement.requestFullscreen = 
            document.documentElement.requestFullscreen ||
            document.documentElement.mozRequestFullScreen ||
            document.documentElement.webkitRequestFullscreen ||
            document.documentElement.msRequestFullscreen;

        // Add fullscreen toggle button if needed
        const toggleFullscreen = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
                    .catch(err => {
                        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
                    });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        };

        // Add keyboard shortcut for fullscreen (F11)
        this.fullscreenShortcut = toggleFullscreen;
    }

    handleKeyboardShortcuts(e) {
        // F11 for fullscreen
        if (e.key === 'F11') {
            e.preventDefault();
            this.fullscreenShortcut();
        }

        // Esc to exit fullscreen
        if (e.key === 'Escape' && document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    handleResize() {
        // Update layout for 4K resolution
        const is4K = window.innerWidth >= 3840 && window.innerHeight >= 2160;
        document.body.classList.toggle('resolution-4k', is4K);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();

    // Set initial screen resolution class
    const is4K = window.innerWidth >= 3840 && window.innerHeight >= 2160;
    document.body.classList.toggle('resolution-4k', is4K);
});
