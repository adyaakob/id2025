import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, X, User, Building, Mail, Phone, Tag, RefreshCw, Trash2, Edit2, Check, XCircle } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editedCard, setEditedCard] = useState<BusinessCard | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const localCards = await storage.getCards();
      setCards(localCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError('Failed to load business cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this business card?')) {
      return;
    }

    setDeleting(cardId);
    setError(null);
    try {
      await storage.deleteCard(cardId);
      // Refresh the list after successful deletion
      await fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      setError('Failed to delete business card. Please try again.');
      // Try to refresh the list anyway to ensure we're showing the latest state
      await fetchCards();
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (card: BusinessCard) => {
    setEditing(card.id);
    setEditedCard({ ...card });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditedCard(null);
  };

  const handleSaveEdit = async () => {
    if (!editedCard) return;

    setUpdating(true);
    try {
      await storage.updateCard(editedCard);
      await fetchCards();
      setEditing(null);
      setEditedCard(null);
    } catch (error) {
      console.error('Error updating card:', error);
      setError('Failed to update business card');
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field: keyof BusinessCard, value: string) => {
    if (!editedCard) return;
    setEditedCard({ ...editedCard, [field]: value });
  };

  const verifyGistStorage = async () => {
    try {
      await (storage as any).verifyGistContent();
    } catch (error) {
      console.error('Error verifying storage:', error);
    }
  };

  const syncStorage = async () => {
    setLoading(true);
    setError(null);
    try {
      await (storage as any).syncStorage();
      await fetchCards();
    } catch (error) {
      console.error('Error syncing storage:', error);
      setError('Failed to sync storage. Please try again.');
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
              onClick={syncStorage}
              title="Sync Storage"
              className="h-8 w-8"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={verifyGistStorage}
              title="Verify Storage"
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
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
                  {editing === card.id && editedCard ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Name</label>
                            <Input
                              value={editedCard.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Name"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Title</label>
                            <Input
                              value={editedCard.title}
                              onChange={(e) => handleInputChange('title', e.target.value)}
                              placeholder="Title"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Company</label>
                            <Input
                              value={editedCard.company}
                              onChange={(e) => handleInputChange('company', e.target.value)}
                              placeholder="Company"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Email</label>
                            <Input
                              value={editedCard.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="Email"
                              type="email"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Phone</label>
                            <Input
                              value={editedCard.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="Phone"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Type</label>
                            <Select
                              value={editedCard.type}
                              onValueChange={(value) => handleInputChange('type', value as 'customer' | 'partner')}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="partner">Partner</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={updating}
                          className="h-8"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updating}
                          className="h-8"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{card.name}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{card.title} at {card.company}</span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${card.email}`} className="text-primary hover:underline">
                            {card.email}
                          </a>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${card.phone}`} className="hover:underline">
                            {card.phone}
                          </a>
                        </p>
                        <p className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{card.type}</span>
                        </p>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(card)}
                          disabled={!!editing}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(card.id)}
                          disabled={deleting === card.id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className={`h-4 w-4 ${deleting === card.id ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
