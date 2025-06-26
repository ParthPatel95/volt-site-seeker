
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Settings } from 'lucide-react';
import { BTCROIFormData } from './types/btc_roi_types';

interface BTCROIInputFormProps {
  mode: 'hosting' | 'self';
  formData: BTCROIFormData;
  onFormDataChange: (data: BTCROIFormData) => void;
  onCalculate: () => void;
  isLoading: boolean;
}

export const BTCROIInputForm: React.FC<BTCROIInputFormProps> = ({
  mode,
  formData,
  onFormDataChange,
  onCalculate,
  isLoading
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof BTCROIFormData, value: string | number) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          ROI Calculator - {mode === 'hosting' ? 'Hosting' : 'Self-Mining'} Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ASIC Model */}
        <div className="space-y-2">
          <Label htmlFor="asicModel">ASIC Model</Label>
          <Input
            id="asicModel"
            value={formData.asicModel}
            onChange={(e) => handleInputChange('asicModel', e.target.value)}
            placeholder="e.g., Antminer S21, WhatsMiner M60"
          />
        </div>

        {/* Basic Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hashrate">Hashrate (TH/s)</Label>
            <Input
              id="hashrate"
              type="number"
              value={formData.hashrate}
              onChange={(e) => handleInputChange('hashrate', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="powerDraw">Power Draw (W)</Label>
            <Input
              id="powerDraw"
              type="number"
              value={formData.powerDraw}
              onChange={(e) => handleInputChange('powerDraw', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="units">Units Purchased</Label>
            <Input
              id="units"
              type="number"
              value={formData.units}
              onChange={(e) => handleInputChange('units', parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hardwareCost">Hardware Cost ($/unit)</Label>
            <Input
              id="hardwareCost"
              type="number"
              value={formData.hardwareCost}
              onChange={(e) => handleInputChange('hardwareCost', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Mode-specific fields */}
        {mode === 'hosting' ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hostingRate">Hosting Rate ($/kWh)</Label>
              <Input
                id="hostingRate"
                type="number"
                step="0.001"
                value={formData.hostingRate}
                onChange={(e) => handleInputChange('hostingRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hostingFee">Monthly Hosting Fee ($/unit)</Label>
              <Input
                id="hostingFee"
                type="number"
                value={formData.hostingFee}
                onChange={(e) => handleInputChange('hostingFee', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="powerRate">Your Power Rate ($/kWh)</Label>
            <Input
              id="powerRate"
              type="number"
              step="0.001"
              value={formData.powerRate}
              onChange={(e) => handleInputChange('powerRate', parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="poolFee">Pool Fee (%)</Label>
            <Input
              id="poolFee"
              type="number"
              step="0.1"
              value={formData.poolFee}
              onChange={(e) => handleInputChange('poolFee', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coolingOverhead">Cooling Overhead (%)</Label>
            <Input
              id="coolingOverhead"
              type="number"
              step="0.1" 
              value={formData.coolingOverhead}
              onChange={(e) => handleInputChange('coolingOverhead', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="flex items-center space-x-2 pt-4 border-t">
          <Switch
            id="advanced"
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
          <Label htmlFor="advanced" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Advanced Settings
          </Label>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="efficiencyOverride">Efficiency Override (%)</Label>
                <Input
                  id="efficiencyOverride"
                  type="number"
                  step="0.1"
                  value={formData.efficiencyOverride}
                  onChange={(e) => handleInputChange('efficiencyOverride', parseFloat(e.target.value) || 100)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resaleValue">Projected Resale Value (%)</Label>
                <Input
                  id="resaleValue"
                  type="number"
                  step="0.1"
                  value={formData.resaleValue}
                  onChange={(e) => handleInputChange('resaleValue', parseFloat(e.target.value) || 20)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maintenancePercent">Maintenance Cost (%)</Label>
              <Input
                id="maintenancePercent"
                type="number"
                step="0.1"
                value={formData.maintenancePercent}
                onChange={(e) => handleInputChange('maintenancePercent', parseFloat(e.target.value) || 2)}
              />
            </div>
          </div>
        )}

        <Button 
          onClick={onCalculate} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Calculating...
            </div>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Calculate My ROI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
