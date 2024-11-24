import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, X, User, Building, Mail, Phone, Tag, RefreshCw, Trash2, Edit2, Check, XCircle } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

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
      console.log('BusinessCardList: Fetching cards...');
      const localCards = await storage.getCards();
      console.log('BusinessCardList: Fetched cards:', localCards);
      setCards(localCards);
    } catch (error) {
      console.error('BusinessCardList: Error fetching cards:', error);
      setError('Failed to load business cards');
      toast({
        title: "Error",
        description: "Failed to load business cards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load cards when component mounts
  useEffect(() => {
    console.log('BusinessCardList: Component mounted');
    fetchCards();
  }, []);

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this business card?')) {
      return;
    }

    setDeleting(cardId);
    setError(null);
    try {
      await storage.deleteCard(cardId);
      await fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      setError('Failed to delete business card. Please try again.');
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
      toast({
        title: "Success",
        description: "Business card updated successfully",
      });
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: "Error",
        description: "Failed to update business card",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field: keyof BusinessCard, value: string) => {
    if (!editedCard) return;
    setEditedCard({ ...editedCard, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-[80%] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <List className="h-5 w-5" />
            Business Cards
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchCards}
              title="Refresh List"
              className="h-8 w-8"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="Close"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="text-red-500 mb-4 text-center">{error}</div>
          )}
          
          <div className="space-y-4">
            {cards.map(card => (
              <Card key={card.id} className="p-4">
                {editing === card.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={editedCard?.name || ''}
                          onChange={e => handleInputChange('name', e.target.value)}
                          placeholder="Name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={editedCard?.title || ''}
                          onChange={e => handleInputChange('title', e.target.value)}
                          placeholder="Title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Company</label>
                        <Input
                          value={editedCard?.company || ''}
                          onChange={e => handleInputChange('company', e.target.value)}
                          placeholder="Company"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          value={editedCard?.email || ''}
                          onChange={e => handleInputChange('email', e.target.value)}
                          placeholder="Email"
                          type="email"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={editedCard?.phone || ''}
                          onChange={e => handleInputChange('phone', e.target.value)}
                          placeholder="Phone"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={editedCard?.type || 'customer'}
                          onValueChange={value => handleInputChange('type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="supplier">Supplier</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updating}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEdit}
                        disabled={updating}
                      >
                        {updating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {card.name}
                        </h3>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {card.title} at {card.company}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(card)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(card.id)}
                          disabled={deleting === card.id}
                          className="h-8 w-8 text-destructive"
                        >
                          {deleting === card.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {card.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {card.phone}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {card.type}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
