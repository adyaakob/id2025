import fs from 'fs';
import path from 'path';
import { BusinessCard } from '@/types/business-card';

// First, define the allowed types
type ContactType = "customer" | "partner";

class CSVStorageManager {
  private filePath: string;
  private headers: string[];

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'business-cards.csv');
    this.headers = ['id', 'name', 'title', 'company', 'email', 'phone', 'type', 'processedDate'];
    this.initializeStorage();
  }

  private initializeStorage() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, this.headers.join(',') + '\n');
    }
  }

  private parseCSVLine(line: string): BusinessCard {
    const values = line.split(',').map(value => value.trim());
    // Validate the type value
    const type = values[6] as string;
    if (type !== "customer" && type !== "partner") {
      // Default to "customer" if invalid value
      values[6] = "customer";
    }

    return {
      id: values[0],
      name: values[1],
      title: values[2],
      company: values[3],
      email: values[4],
      phone: values[5],
      type: values[6] as ContactType, // Type assertion after validation
      processedDate: values[7]
    };
  }

  private cardToCSVLine(card: BusinessCard): string {
    return this.headers
      .map(header => {
        const value = card[header as keyof BusinessCard];
        // Escape commas and quotes in the value
        return value.includes(',') ? `"${value}"` : value;
      })
      .join(',');
  }

  async getCards(): Promise<BusinessCard[]> {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      // Skip the header line
      return lines.slice(1).map(line => this.parseCSVLine(line));
    } catch (error) {
      console.error('Error reading CSV file:', error);
      return [];
    }
  }

  async saveCard(card: BusinessCard): Promise<BusinessCard> {
    try {
      const cardToSave = {
        ...card,
        id: card.id || crypto.randomUUID(),
        processedDate: card.processedDate || new Date().toISOString()
      };

      const csvLine = this.cardToCSVLine(cardToSave);
      fs.appendFileSync(this.filePath, csvLine + '\n');
      
      return cardToSave;
    } catch (error) {
      console.error('Error saving card to CSV:', error);
      throw error;
    }
  }

  async updateCard(updatedCard: BusinessCard): Promise<void> {
    try {
      const cards = await this.getCards();
      const cardIndex = cards.findIndex(card => card.id === updatedCard.id);
      
      if (cardIndex === -1) {
        throw new Error('Card not found');
      }
      
      cards[cardIndex] = updatedCard;
      
      // Rewrite the entire file
      const content = this.headers.join(',') + '\n' + 
        cards.map(card => this.cardToCSVLine(card)).join('\n');
      fs.writeFileSync(this.filePath, content);
    } catch (error) {
      console.error('Error updating card in CSV:', error);
      throw error;
    }
  }

  async deleteCard(cardId: string): Promise<void> {
    try {
      const cards = await this.getCards();
      const filteredCards = cards.filter(card => card.id !== cardId);
      
      // Rewrite the entire file
      const content = this.headers.join(',') + '\n' + 
        filteredCards.map(card => this.cardToCSVLine(card)).join('\n');
      fs.writeFileSync(this.filePath, content);
    } catch (error) {
      console.error('Error deleting card from CSV:', error);
      throw error;
    }
  }

  async exportToCSV(targetPath: string): Promise<void> {
    try {
      fs.copyFileSync(this.filePath, targetPath);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }

  async importFromCSV(sourcePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(sourcePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      // Verify headers
      const importHeaders = lines[0].split(',').map(h => h.trim());
      if (!this.headers.every(h => importHeaders.includes(h))) {
        throw new Error('Invalid CSV format: missing required headers');
      }
      
      // Replace current data with imported data
      fs.copyFileSync(sourcePath, this.filePath);
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw error;
    }
  }
}

export const csvStorage = new CSVStorageManager();
