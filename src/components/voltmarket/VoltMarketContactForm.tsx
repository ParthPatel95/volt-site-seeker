import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, X } from 'lucide-react';

interface VoltMarketContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  listingOwnerId: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const VoltMarketContactForm: React.FC<VoltMarketContactFormProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  listingOwnerId
}) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Email, and Message).",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('voltmarket_contact_messages')
        .insert({
          listing_id: listingId,
          sender_name: formData.name,
          sender_email: formData.email,
          sender_phone: formData.phone || null,
          message: formData.message,
          listing_owner_id: listingOwnerId
        });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Your message has been sent to the listing owner. They will review it and contact you directly."
      });

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      onClose();
    } catch (error) {
      console.error('Error sending contact message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Contact Seller
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Regarding: <span className="font-medium">{listingTitle}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="I'm interested in this listing. Could you provide more information about..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 mt-2">
          * Required fields. The listing owner will contact you directly using the information provided.
        </div>
      </DialogContent>
    </Dialog>
  );
};