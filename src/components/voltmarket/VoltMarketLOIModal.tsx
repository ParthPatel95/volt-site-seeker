
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VoltMarketLOIForm } from './VoltMarketLOIForm';

interface LOIFormData {
  offering_price: number;
  proposed_terms: string;
  due_diligence_period_days: number;
  contingencies?: string;
  financing_details?: string;
  closing_timeline: string;
  buyer_qualifications: string;
  additional_notes?: string;
}

interface VoltMarketLOIModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  askingPrice: number;
  onSubmit: (data: LOIFormData) => Promise<void>;
}

export const VoltMarketLOIModal: React.FC<VoltMarketLOIModalProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  askingPrice,
  onSubmit
}) => {
  const handleSubmit = async (data: LOIFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Letter of Intent</DialogTitle>
        </DialogHeader>
        <VoltMarketLOIForm
          listingId={listingId}
          listingTitle={listingTitle}
          askingPrice={askingPrice}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
