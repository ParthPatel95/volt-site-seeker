
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Sparkles } from 'lucide-react';

interface BTCROICalculationSaveFormProps {
  onSave: (siteName?: string) => void;
  isVisible: boolean;
}

export const BTCROICalculationSaveForm: React.FC<BTCROICalculationSaveFormProps> = ({
  onSave,
  isVisible
}) => {
  const [siteName, setSiteName] = useState('');

  const handleSave = () => {
    onSave(siteName.trim() || undefined);
    setSiteName('');
  };

  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Save Current Calculation</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteName" className="text-sm font-medium">
              Site Name (Optional)
            </Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Leave blank for auto-generated name"
              className="bg-white border-blue-200 focus:border-blue-400"
            />
            <p className="text-xs text-blue-600">
              Auto-generated names follow the pattern: "Wattbyte Campus #"
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Calculation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
