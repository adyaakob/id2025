import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, X, User, Building, Mail, Phone, Tag, RefreshCw } from 'lucide-react';
import { storage } from '@/lib/storage';

interface BusinessCard {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  type: 'customer' | 'partner';
  processedDate: string;
}

export default function BusinessCardList({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const cards = await storage.getCards();
      setCards(cards);
    } catch (error) {
      setError('Failed to load business cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-[80%] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <List className="h-5 w-5" />
            Processed Business Cards
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchCards}
              className="h-8 w-8"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Loading business cards...</p>
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">
              <p className="mb-2">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCards}
                className="mx-auto"
              >
                Try Again
              </Button>
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No business cards processed yet.</p>
              <p className="text-sm mt-1">Scan a business card to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card) => (
                <Card key={card.id} className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{card.name}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {card.company}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {card.email}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {card.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Processed: {new Date(card.processedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
