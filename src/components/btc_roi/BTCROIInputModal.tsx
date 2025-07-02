
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BTCROIInputForm } from './BTCROIInputForm';
import { BTCROIFormData } from './types/btc_roi_types';

interface BTCROIInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'hosting' | 'self';
  formData: BTCROIFormData;
  onFormDataChange: (data: BTCROIFormData) => void;
  onCalculate: () => void;
  isLoading: boolean;
}

export const BTCROIInputModal: React.FC<BTCROIInputModalProps> = ({
  isOpen,
  onClose,
  mode,
  formData,
  onFormDataChange,
  onCalculate,
  isLoading
}) => {
  const handleCalculate = () => {
    onCalculate();
    onClose(); // Close modal after calculation
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {mode === 'hosting' ? '⚡ Configure Hosting Business' : '🏠 Configure Self-Mining'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <BTCROIInputForm
            mode={mode}
            formData={formData}
            onFormDataChange={onFormDataChange}
            onCalculate={handleCalculate}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
