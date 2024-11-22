import { BusinessCard } from '@/types/business-card';

const STORAGE_KEY = 'business_cards_v2';

class StorageManager {
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  private getLocalCards(): BusinessCard[] {
    if (!this.isLocalStorageAvailable()) {
      console.warn('LocalStorage is not available');
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  async saveCard(card: BusinessCard): Promise<BusinessCard> {
    if (!this.isLocalStorageAvailable()) {
      console.warn('LocalStorage is not available, card will not be persisted');
      return card;
    }

    try {
      const existingCards = this.getLocalCards();
      
      // If card has no ID, generate one
      const cardToSave = {
        ...card,
        id: card.id || crypto.randomUUID(),
        processedDate: card.processedDate || new Date().toISOString()
      };
      
      // Add new card
      existingCards.push(cardToSave);
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingCards));
      
      return cardToSave;
    } catch (error) {
      console.error('Failed to save card:', error);
      throw new Error('Failed to save business card');
    }
  }

  async getCards(): Promise<BusinessCard[]> {
    return this.getLocalCards();
  }
}

export const storage = new StorageManager();
