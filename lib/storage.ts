import { BusinessCard } from '@/types/business-card';

class StorageManager {
  async getCards(): Promise<BusinessCard[]> {
    try {
      console.log('StorageManager: Fetching cards from API...');
      const response = await fetch('/api/business-cards');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cards');
      }
      const data = await response.json();
      console.log('StorageManager: Fetched cards:', data.cards);
      return data.cards;
    } catch (error) {
      console.error('StorageManager: Error fetching cards:', error);
      throw error;
    }
  }

  async saveCard(card: Omit<BusinessCard, 'id' | 'processedDate'>): Promise<BusinessCard> {
    try {
      console.log('StorageManager: Saving card:', card);
      const response = await fetch('/api/business-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(card),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save card');
      }
      const data = await response.json();
      console.log('StorageManager: Saved card:', data.card);
      return data.card;
    } catch (error) {
      console.error('StorageManager: Error saving card:', error);
      throw error;
    }
  }

  async updateCard(card: BusinessCard): Promise<BusinessCard> {
    try {
      console.log('StorageManager: Updating card:', card);
      const response = await fetch('/api/business-cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(card),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update card');
      }
      const data = await response.json();
      console.log('StorageManager: Updated card:', data.card);
      return data.card;
    } catch (error) {
      console.error('StorageManager: Error updating card:', error);
      throw error;
    }
  }

  async deleteCard(id: string): Promise<void> {
    try {
      console.log('StorageManager: Deleting card:', id);
      const response = await fetch('/api/business-cards', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete card');
      }
      console.log('StorageManager: Deleted card:', id);
    } catch (error) {
      console.error('StorageManager: Error deleting card:', error);
      throw error;
    }
  }
}

export const storage = new StorageManager();
