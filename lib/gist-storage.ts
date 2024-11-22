import { BusinessCard } from '@/types/business-card';

const GIST_ID = process.env.NEXT_PUBLIC_GIST_ID;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

class GistStorageManager {
  private async fetchGist() {
    if (!GIST_ID || !GITHUB_TOKEN) {
      throw new Error('GitHub Gist configuration is missing');
    }

    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch gist');
    }

    const gist = await response.json();
    const content = gist.files['business_cards.json']?.content || '[]';
    return JSON.parse(content) as BusinessCard[];
  }

  private async updateGist(cards: BusinessCard[]) {
    if (!GIST_ID || !GITHUB_TOKEN) {
      throw new Error('GitHub Gist configuration is missing');
    }

    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
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
      throw new Error('Failed to update gist');
    }
  }

  async getCards(): Promise<BusinessCard[]> {
    try {
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
      
      await this.updateGist(updatedCards);
      
      // Also update localStorage as backup
      localStorage.setItem('business_cards_v2', JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Failed to delete card from Gist:', error);
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
}

export const gistStorage = new GistStorageManager();
