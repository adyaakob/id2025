import { BusinessCard } from '@/types/business-card';
import { GITHUB_CONFIG } from '@/config/env.config';

const { GITHUB_TOKEN, GIST_ID } = GITHUB_CONFIG;

class GistStorageManager {
  private async fetchGist() {
    if (!GIST_ID || !GITHUB_TOKEN) {
      throw new Error('GitHub Gist configuration is missing');
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gist API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch gist: ${response.status} ${response.statusText}`);
      }

      const gist = await response.json();
      const content = gist.files['business_cards.json']?.content || '[]';
      return JSON.parse(content) as BusinessCard[];
    } catch (error) {
      console.error('Error fetching gist:', error);
      throw error;
    }
  }

  private async updateGist(cards: BusinessCard[]) {
    if (!GIST_ID || !GITHUB_TOKEN) {
      throw new Error('GitHub Gist configuration is missing');
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'business_cards.json': {
              content: JSON.stringify(cards, null, 2)
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gist API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to update gist: ${response.status} ${response.statusText}`);
      }

      // Update localStorage as backup
      localStorage.setItem('business_cards_v2', JSON.stringify(cards));
    } catch (error) {
      console.error('Error updating gist:', error);
      throw error;
    }
  }

  async syncStorage(): Promise<void> {
    if (!GIST_ID || !GITHUB_TOKEN) {
      console.error('Missing configuration:', { GIST_ID: !!GIST_ID, GITHUB_TOKEN: !!GITHUB_TOKEN });
      throw new Error('GitHub Gist configuration is missing. Please check your environment variables.');
    }

    try {
      // Get cards from both storages
      const localCards = JSON.parse(localStorage.getItem('business_cards_v2') || '[]');
      console.log('Local cards:', localCards);
      
      // Fetch from Gist
      const gistCards = await this.fetchGist();
      console.log('Gist cards:', gistCards);

      // Merge cards, removing duplicates by ID
      const allCards = [...localCards, ...gistCards];
      const uniqueCards = Array.from(
        new Map(allCards.map(card => [card.id, card])).values()
      );

      // Sort by processedDate
      uniqueCards.sort((a, b) => 
        new Date(b.processedDate).getTime() - new Date(a.processedDate).getTime()
      );

      console.log('Merged unique cards:', uniqueCards);

      // Update both storages
      await this.updateGist(uniqueCards);
      localStorage.setItem('business_cards_v2', JSON.stringify(uniqueCards));

      console.log('Storage synced successfully:', uniqueCards);
      return;
    } catch (error) {
      console.error('Detailed sync error:', error);
      throw error;
    }
  }

  async getCards(): Promise<BusinessCard[]> {
    try {
      // Try to sync first
      await this.syncStorage();
      return await this.fetchGist();
    } catch (error) {
      console.error('Error fetching cards from Gist:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('business_cards_v2');
      return stored ? JSON.parse(stored) : [];
    }
  }

  async saveCard(card: BusinessCard): Promise<BusinessCard> {
    try {
      const existingCards = await this.getCards();
      
      const cardToSave = {
        ...card,
        id: card.id || crypto.randomUUID(),
        processedDate: card.processedDate || new Date().toISOString()
      };
      
      existingCards.push(cardToSave);
      await this.updateGist(existingCards);
      
      // Also update localStorage as backup
      localStorage.setItem('business_cards_v2', JSON.stringify(existingCards));
      
      return cardToSave;
    } catch (error) {
      console.error('Failed to save card to Gist:', error);
      // Fallback to localStorage
      return this.saveToLocalStorage(card);
    }
  }

  async updateCard(updatedCard: BusinessCard): Promise<BusinessCard> {
    try {
      const existingCards = await this.getCards();
      const index = existingCards.findIndex(card => card.id === updatedCard.id);
      
      if (index === -1) {
        throw new Error('Card not found');
      }

      existingCards[index] = {
        ...updatedCard,
        id: existingCards[index].id,
        processedDate: existingCards[index].processedDate
      };

      await this.updateGist(existingCards);
      
      // Also update localStorage as backup
      localStorage.setItem('business_cards_v2', JSON.stringify(existingCards));
      
      return existingCards[index];
    } catch (error) {
      console.error('Failed to update card in Gist:', error);
      throw new Error('Failed to update business card');
    }
  }

  async deleteCard(cardId: string): Promise<void> {
    try {
      const existingCards = await this.getCards();
      const updatedCards = existingCards.filter(card => card.id !== cardId);
      
      try {
        await this.updateGist(updatedCards);
      } catch (error) {
        console.error('Failed to update gist, falling back to localStorage:', error);
        // Update localStorage even if gist update fails
        localStorage.setItem('business_cards_v2', JSON.stringify(updatedCards));
      }
    } catch (error) {
      console.error('Failed to delete card:', error);
      throw new Error('Failed to delete business card');
    }
  }

  private saveToLocalStorage(card: BusinessCard): BusinessCard {
    try {
      const stored = localStorage.getItem('business_cards_v2');
      const existingCards = stored ? JSON.parse(stored) : [];
      
      const cardToSave = {
        ...card,
        id: card.id || crypto.randomUUID(),
        processedDate: card.processedDate || new Date().toISOString()
      };
      
      existingCards.push(cardToSave);
      localStorage.setItem('business_cards_v2', JSON.stringify(existingCards));
      
      return cardToSave;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Failed to save business card');
    }
  }

  async verifyGistContent(): Promise<void> {
    if (!GIST_ID || !GITHUB_TOKEN) {
      console.error('GitHub Gist configuration is missing');
      return;
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gist: ${response.status} ${response.statusText}`);
      }

      const gist = await response.json();
      const content = gist.files['business_cards.json']?.content;
      
      if (!content) {
        console.log('No business cards found in Gist');
        return;
      }

      const cards = JSON.parse(content);
      console.log('Business Cards stored in Gist:', cards);
    } catch (error) {
      console.error('Error verifying Gist content:', error);
    }
  }
}

export const gistStorage = new GistStorageManager();
