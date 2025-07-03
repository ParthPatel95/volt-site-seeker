
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useVoltMarketConversations } from '@/hooks/useVoltMarketConversations';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface VoltMarketContactButtonProps {
  listingId: string;
  sellerId: string;
  className?: string;
}

export const VoltMarketContactButton: React.FC<VoltMarketContactButtonProps> = ({
  listingId,
  sellerId,
  className
}) => {
  const { user, profile } = useVoltMarketAuth();
  const { createConversation, conversations } = useVoltMarketConversations();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleContact = async () => {
    if (!user || !profile) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact the seller.",
        variant: "destructive"
      });
      return;
    }

    // Check if conversation already exists
    const existingConversation = conversations.find(
      conv => conv.listing_id === listingId && 
      ((conv.buyer_id === profile.id && conv.seller_id === sellerId) ||
       (conv.seller_id === profile.id && conv.buyer_id === sellerId))
    );

    if (existingConversation) {
      // Navigate to existing conversation
      navigate('/voltmarket/messages');
      return;
    }

    // Create new conversation
    const conversation = await createConversation(listingId, sellerId);
    if (conversation) {
      toast({
        title: "Conversation started",
        description: "You can now message the seller about this listing."
      });
      navigate('/voltmarket/messages');
    } else {
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button onClick={handleContact} className={className}>
      <MessageSquare className="w-4 h-4 mr-2" />
      Contact Seller
    </Button>
  );
};
