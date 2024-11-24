export interface BusinessCard {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  type: 'customer' | 'partner';
  id: string;
  processedDate: string;
}
