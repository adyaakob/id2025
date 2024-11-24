import { BusinessCard } from '@/types/types';

const STORAGE_KEY = 'businessCards';
const IMAGE_STORAGE_KEY = 'businessCardImages';

export const storage = {
  getBusinessCards: (): BusinessCard[] => {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting business cards:', error);
      return [];
    }
  },

  saveBusinessCard: (card: BusinessCard, imageData?: string) => {
    try {
      if (typeof window === 'undefined') return;
      
      // Save the business card data
      const cards = storage.getBusinessCards();
      cards.push(card);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));

      // Save the image if provided
      if (imageData) {
        const images = storage.getBusinessCardImages();
        images[card.id] = imageData;
        localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
      }
    } catch (error) {
      console.error('Error saving business card:', error);
      throw new Error('Failed to save business card');
    }
  },

  getBusinessCardImages: (): Record<string, string> => {
    try {
      if (typeof window === 'undefined') return {};
      const data = localStorage.getItem(IMAGE_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting business card images:', error);
      return {};
    }
  },

  getBusinessCardImage: (cardId: string): string | null => {
    try {
      const images = storage.getBusinessCardImages();
      return images[cardId] || null;
    } catch (error) {
      console.error('Error getting business card image:', error);
      return null;
    }
  },

  deleteBusinessCard: (cardId: string) => {
    try {
      if (typeof window === 'undefined') return;
      
      // Remove card data
      const cards = storage.getBusinessCards();
      const updatedCards = cards.filter(card => card.id !== cardId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));

      // Remove image data
      const images = storage.getBusinessCardImages();
      delete images[cardId];
      localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error deleting business card:', error);
      throw new Error('Failed to delete business card');
    }
  },

  clearBusinessCards: () => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(IMAGE_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing business cards:', error);
      throw new Error('Failed to clear business cards');
    }
  }
};
