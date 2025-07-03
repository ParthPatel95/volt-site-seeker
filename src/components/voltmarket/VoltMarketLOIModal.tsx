
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';

interface VoltMarketLOIModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  askingPrice: number;
  onSubmit: (loiData: any) => Promise<void>;
}

export const VoltMarketLOIModal: React.FC<VoltMarketLOIModalProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  askingPrice,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    offering_price: askingPrice * 0.9, // Start at 90% of asking price
    proposed_terms: '',
    due_diligence_period_days: 30,
    contingencies: '',
    financing_details: '',
    closing_timeline: '60 days',
    buyer_qualifications: '',
    additional_notes: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        offering_price: askingPrice * 0.9,
        proposed_terms: '',
        due_diligence_period_days: 30,
        contingencies: '',
        financing_details: '',
        closing_timeline: '60 days',
        buyer_qualifications: '',
        additional_notes: ''
      });
    } catch (error) {
      console.error('Error submitting LOI:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submit Letter of Intent
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Listing Details</h3>
            <p className="text-sm text-gray-600">{listingTitle}</p>
            <p className="text-sm text-gray-600">Asking Price: ${askingPrice.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="offering_price">Offering Price ($)</Label>
              <Input
                id="offering_price"
                type="number"
                value={formData.offering_price}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  offering_price: parseFloat(e.target.value) || 0 
                }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="due_diligence_period">Due Diligence Period (Days)</Label>
              <Input
                id="due_diligence_period"
                type="number"
                value={formData.due_diligence_period_days}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  due_diligence_period_days: parseInt(e.target.value) || 30 
                }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="closing_timeline">Closing Timeline</Label>
            <Select 
              value={formData.closing_timeline} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, closing_timeline: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30 days">30 days</SelectItem>
                <SelectItem value="60 days">60 days</SelectItem>
                <SelectItem value="90 days">90 days</SelectItem>
                <SelectItem value="120 days">120 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="proposed_terms">Proposed Terms</Label>
            <Textarea
              id="proposed_terms"
              value={formData.proposed_terms}
              onChange={(e) => setFormData(prev => ({ ...prev, proposed_terms: e.target.value }))}
              placeholder="Describe your proposed terms and conditions..."
              required
            />
          </div>

          <div>
            <Label htmlFor="buyer_qualifications">Buyer Qualifications</Label>
            <Textarea
              id="buyer_qualifications"
              value={formData.buyer_qualifications}
              onChange={(e) => setFormData(prev => ({ ...prev, buyer_qualifications: e.target.value }))}
              placeholder="Describe your qualifications and experience..."
              required
            />
          </div>

          <div>
            <Label htmlFor="financing_details">Financing Details</Label>
            <Textarea
              id="financing_details"
              value={formData.financing_details}
              onChange={(e) => setFormData(prev => ({ ...prev, financing_details: e.target.value }))}
              placeholder="Describe your financing arrangements..."
            />
          </div>

          <div>
            <Label htmlFor="contingencies">Contingencies</Label>
            <Textarea
              id="contingencies"
              value={formData.contingencies}
              onChange={(e) => setFormData(prev => ({ ...prev, contingencies: e.target.value }))}
              placeholder="List any contingencies for this offer..."
            />
          </div>

          <div>
            <Label htmlFor="additional_notes">Additional Notes</Label>
            <Textarea
              id="additional_notes"
              value={formData.additional_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, additional_notes: e.target.value }))}
              placeholder="Any additional information or comments..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit LOI'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
