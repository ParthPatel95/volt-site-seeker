import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { VoltMarketContactForm } from './VoltMarketContactForm';

interface VoltMarketContactButtonProps {
  listingId: string;
  sellerId: string;
  listingTitle: string;
  className?: string;
}

export const VoltMarketContactButton: React.FC<VoltMarketContactButtonProps> = ({
  listingId,
  sellerId,
  listingTitle,
  className
}) => {
  const [showContactForm, setShowContactForm] = useState(false);

  const handleContact = () => {
    setShowContactForm(true);
  };

  return (
    <>
      <Button onClick={handleContact} className={className}>
        <MessageSquare className="w-4 h-4 mr-1 md:mr-2 flex-shrink-0" />
        <span className="truncate">Contact Seller</span>
      </Button>

      <VoltMarketContactForm
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        listingId={listingId}
        listingTitle={listingTitle}
        listingOwnerId={sellerId}
      />
    </>
  );
};
