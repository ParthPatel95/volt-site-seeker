
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Settings, Zap, Building2 } from 'lucide-react';
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
  const [showManualEnergy, setShowManualEnergy] = useState(formData.useManualEnergyCosts || false);

  const handleInputChange = (field: keyof BTCROIFormData, value: string | number | boolean) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const renderSelfMiningInputs = () => (
    <>
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
    </>
  );

  const renderHostingInputs = () => (
    <>
      {/* Site Name */}
      <div className="space-y-2">
        <Label htmlFor="siteName">Site Name (Optional)</Label>
        <Input
          id="siteName"
          value={formData.siteName || ''}
          onChange={(e) => handleInputChange('siteName', e.target.value)}
          placeholder="e.g., Wattbyte Campus 1, Texas Facility"
        />
        <p className="text-xs text-muted-foreground">Leave blank for auto-generated name</p>
      </div>

      {/* Facility Scale */}
      <div className="space-y-2">
        <Label htmlFor="totalLoadKW">Total Facility Load (kW)</Label>
        <Input
          id="totalLoadKW"
          type="number"
          value={formData.totalLoadKW}
          onChange={(e) => handleInputChange('totalLoadKW', parseFloat(e.target.value) || 0)}
          placeholder="e.g., 300 kW (100 miners × 3kW each)"
        />
        <p className="text-xs text-muted-foreground">Total power consumption of all hosted miners</p>
      </div>

      {/* Hosting Fee Rate */}
      <div className="space-y-2">
        <Label htmlFor="hostingFeeRate">Hosting Fee Rate ($/kWh USD)</Label>
        <Input
          id="hostingFeeRate"
          type="number"
          step="0.001"
          value={formData.hostingFeeRate}
          onChange={(e) => handleInputChange('hostingFeeRate', parseFloat(e.target.value) || 0)}
          placeholder="e.g., 0.08"
        />
        <p className="text-xs text-muted-foreground">Rate charged to clients per kWh consumed (always USD)</p>
      </div>

      {/* Region Selection */}
      <div className="space-y-2">
        <Label htmlFor="region">Energy Market Region</Label>
        <Select value={formData.region} onValueChange={(value: 'ERCOT' | 'AESO' | 'Other') => handleInputChange('region', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ERCOT">ERCOT (Texas)</SelectItem>
            <SelectItem value="AESO">AESO (Alberta)</SelectItem>
            <SelectItem value="Other">Other (Custom)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {formData.region !== 'Other' 
            ? 'Uses live wholesale electricity price data with regional tax rates'
            : 'Allows manual electricity cost input'
          }
        </p>
      </div>

      {/* Custom Electricity Cost (only for Other region and when not using manual) */}
      {formData.region === 'Other' && !showManualEnergy && (
        <div className="space-y-2">
          <Label htmlFor="customElectricityCost">Your Electricity Cost ($/kWh USD)</Label>
          <Input
            id="customElectricityCost"
            type="number"
            step="0.001"
            value={formData.customElectricityCost}
            onChange={(e) => handleInputChange('customElectricityCost', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 0.05"
          />
          <p className="text-xs text-muted-foreground">Wholesale electricity cost paid by your facility</p>
        </div>
      )}

      {/* Manual Energy Costs Toggle */}
      <div className="flex items-center space-x-2 pt-4 border-t">
        <Switch
          id="manualEnergy"
          checked={showManualEnergy}
          onCheckedChange={(checked) => {
            setShowManualEnergy(checked);
            handleInputChange('useManualEnergyCosts', checked);
          }}
        />
        <Label htmlFor="manualEnergy" className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Manual Energy Cost Override
        </Label>
      </div>

      {/* Manual Energy Cost Inputs */}
      {showManualEnergy && (
        <div className="space-y-4 pt-4 border-t bg-primary/5 p-4 rounded-lg">
          <h4 className="font-medium text-primary">Manual Energy Rate Components ($/kWh USD)</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manualEnergyRate">Wholesale Energy Rate</Label>
              <Input
                id="manualEnergyRate"
                type="number"
                step="0.0001"
                value={formData.manualEnergyRate || 0}
                onChange={(e) => handleInputChange('manualEnergyRate', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 0.0250"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manualTransmissionRate">Transmission Rate</Label>
              <Input
                id="manualTransmissionRate"
                type="number"
                step="0.0001"
                value={formData.manualTransmissionRate || 0}
                onChange={(e) => handleInputChange('manualTransmissionRate', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 0.0015"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manualDistributionRate">Distribution Rate</Label>
              <Input
                id="manualDistributionRate"
                type="number"
                step="0.0001"
                value={formData.manualDistributionRate || 0}
                onChange={(e) => handleInputChange('manualDistributionRate', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 0.0026"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manualAncillaryRate">Ancillary Services</Label>
              <Input
                id="manualAncillaryRate"
                type="number"
                step="0.0001"
                value={formData.manualAncillaryRate || 0}
                onChange={(e) => handleInputChange('manualAncillaryRate', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 0.0015"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="manualRegulatoryRate">Regulatory Fees</Label>
              <Input
                id="manualRegulatoryRate"
                type="number"
                step="0.0001"
                value={formData.manualRegulatoryRate || 0}
                onChange={(e) => handleInputChange('manualRegulatoryRate', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 0.0015"
              />
            </div>
          </div>
          
          <div className="text-sm text-primary bg-primary/10 p-3 rounded">
            <strong>Total Manual Rate: ${((formData.manualEnergyRate || 0) + (formData.manualTransmissionRate || 0) + (formData.manualDistributionRate || 0) + (formData.manualAncillaryRate || 0) + (formData.manualRegulatoryRate || 0)).toFixed(4)}/kWh USD</strong>
          </div>
        </div>
      )}

      {/* Infrastructure Investment */}
      <div className="space-y-2">
        <Label htmlFor="infrastructureCost">Infrastructure Investment ($)</Label>
        <Input
          id="infrastructureCost"
          type="number"
          value={formData.infrastructureCost}
          onChange={(e) => handleInputChange('infrastructureCost', parseFloat(e.target.value) || 0)}
          placeholder="e.g., 200000"
        />
        <p className="text-xs text-muted-foreground">Initial CapEx for facility build-out (set to 0 if existing facility)</p>
      </div>

      {/* Operational Overhead */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthlyOverhead">Monthly Overhead ($)</Label>
          <Input
            id="monthlyOverhead"
            type="number"
            value={formData.monthlyOverhead}
            onChange={(e) => handleInputChange('monthlyOverhead', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 5000"
          />
          <p className="text-xs text-muted-foreground">Staff, maintenance, insurance, etc.</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="powerOverheadPercent">Power Overhead (%)</Label>
          <Input
            id="powerOverheadPercent"
            type="number"
            step="0.1"
            value={formData.powerOverheadPercent}
            onChange={(e) => handleInputChange('powerOverheadPercent', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 5"
          />
          <p className="text-xs text-muted-foreground">Additional power for cooling, transformers</p>
        </div>
      </div>

      {/* Expected Uptime */}
      <div className="space-y-2">
        <Label htmlFor="expectedUptimePercent">Expected Uptime (%)</Label>
        <Input
          id="expectedUptimePercent"
          type="number"
          step="0.1"
          value={formData.expectedUptimePercent}
          onChange={(e) => handleInputChange('expectedUptimePercent', parseFloat(e.target.value) || 0)}
          placeholder="e.g., 95"
        />
        <p className="text-xs text-muted-foreground">For Other region only; ERCOT/AESO use smart curtailment</p>
      </div>
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'hosting' ? <Building2 className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
          {mode === 'hosting' ? 'Hosting Profitability Calculator' : 'Mining ROI Calculator'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Site Name for both modes */}
        {mode === 'self' && (
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name (Optional)</Label>
            <Input
              id="siteName"
              value={formData.siteName || ''}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              placeholder="e.g., Home Mining Setup, Garage Farm"
            />
            <p className="text-xs text-muted-foreground">Leave blank for auto-generated name</p>
          </div>
        )}

        {mode === 'self' ? renderSelfMiningInputs() : renderHostingInputs()}

        {/* Advanced Settings Toggle (only for self-mining) */}
        {mode === 'self' && (
          <>
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
              <div className="space-y-4 pt-4 border-t bg-muted p-4 rounded-lg">
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
          </>
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
              {mode === 'hosting' ? <Building2 className="w-4 h-4 mr-2" /> : <Calculator className="w-4 h-4 mr-2" />}
              Calculate {mode === 'hosting' ? 'Hosting Profitability' : 'Mining ROI'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
