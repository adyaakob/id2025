import { BusinessCard } from '@/types/business-card';
import { GITHUB_CONFIG } from '@/config/env.config';

const { GIST_ID } = GITHUB_CONFIG;

class GistStorageManager {
  private async fetchGist() {
    if (!GIST_ID) {
      throw new Error('GitHub Gist configuration is missing');
    }

    try {
      const response = await fetch('/api/sync');
      
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
    if (!GIST_ID) {
      throw new Error('GitHub Gist configuration is missing');
    }

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
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
    if (!GIST_ID) {
      console.error('Missing configuration:', { GIST_ID: !!GIST_ID });
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

  async updateCard(updatedCard: BusinessCard): Promise<void> {
    try {
      const existingCards = await this.getCards();
      const cardIndex = existingCards.findIndex(card => card.id === updatedCard.id);
      
      if (cardIndex === -1) {
        throw new Error('Card not found');
      }
      
      existingCards[cardIndex] = updatedCard;
      await this.updateGist(existingCards);
      
      // Update localStorage as backup
      localStorage.setItem('business_cards_v2', JSON.stringify(existingCards));
    } catch (error) {
      console.error('Failed to update card:', error);
      throw new Error('Failed to update business card');
    }
  }

  private saveToLocalStorage(card: BusinessCard): BusinessCard {
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
  }

  async verifyGistContent(): Promise<void> {
    if (!GIST_ID) {
      console.error('GitHub Gist configuration is missing');
      return;
    }

    try {
      const response = await fetch('/api/sync');

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
