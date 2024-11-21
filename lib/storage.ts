import { BusinessCard } from '@/types/business-card';

const STORAGE_KEY = 'business_cards_v2'; // Changed key to force fresh storage

export const storage = {
  async saveCard(card: BusinessCard): Promise<BusinessCard> {
    try {
      // Get existing cards
      const existingCards = this.getLocalCards();
      
      // Add new card
      existingCards.push(card);
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingCards));
      
      return card;
    } catch (error) {
      console.error('Failed to save card:', error);
      throw new Error('Failed to save business card');
    }
  },

  async getCards(): Promise<BusinessCard[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get cards:', error);
      return [];
    }
  },

  private getLocalCards(): BusinessCard[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
};
