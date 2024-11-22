export interface BusinessCard {
  id?: string;
  processedDate?: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  type: 'customer' | 'partner';
}
