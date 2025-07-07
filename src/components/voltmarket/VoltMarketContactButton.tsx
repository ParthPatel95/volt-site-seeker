
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useVoltMarketConversations } from '@/hooks/useVoltMarketConversations';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { useToast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();
  const { profile } = useVoltMarketAuth();
  const { createConversation } = useVoltMarketConversations();
  const { toast } = useToast();

  const handleContact = async () => {
    if (!profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to contact the seller.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createConversation(listingId, sellerId);
      // Navigate directly to messages instead of just showing a popup
      navigate('/voltmarket/messages');
    } catch (error) {
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
