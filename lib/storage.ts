import { BusinessCard } from '@/types/types';

const STORAGE_KEY = 'businessCards';
const IMAGE_STORAGE_KEY = 'businessCardImages';

export const storage = {
  getBusinessCards: (): BusinessCard[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveBusinessCard: (card: BusinessCard, imageData?: string) => {
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
  },

  getBusinessCardImages: (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(IMAGE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  clearBusinessCards: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(IMAGE_STORAGE_KEY);
  }
};
