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

  async updateCard(updatedCard: BusinessCard): Promise<BusinessCard> {
    if (!this.isLocalStorageAvailable()) {
      console.warn('LocalStorage is not available');
      throw new Error('LocalStorage is not available');
    }

    try {
      const existingCards = this.getLocalCards();
      const index = existingCards.findIndex(card => card.id === updatedCard.id);
      
      if (index === -1) {
        throw new Error('Card not found');
      }

      // Update the card while preserving id and processedDate
      existingCards[index] = {
        ...updatedCard,
        id: existingCards[index].id,
        processedDate: existingCards[index].processedDate
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingCards));
      return existingCards[index];
    } catch (error) {
      console.error('Failed to update card:', error);
      throw new Error('Failed to update business card');
    }
  }

  async deleteCard(cardId: string): Promise<void> {
    if (!this.isLocalStorageAvailable()) {
      console.warn('LocalStorage is not available');
      return;
    }

    try {
      const existingCards = this.getLocalCards();
      const updatedCards = existingCards.filter(card => card.id !== cardId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Failed to delete card:', error);
      throw new Error('Failed to delete business card');
    }
  }

  async getCards(): Promise<BusinessCard[]> {
    return this.getLocalCards();
  }
}

export { gistStorage as storage } from './gist-storage';
