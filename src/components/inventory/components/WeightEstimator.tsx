import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Scale, Calculator, Ruler, Eye, Edit2, Check } from 'lucide-react';
import { 
  MetalType, 
  WeightUnit, 
  WeightDimensions,
  COMMON_WEIGHTS_PER_FOOT,
  MATERIAL_DENSITIES,
  calculateWeight
} from '../types/demolition.types';
import { cn } from '@/lib/utils';

interface WeightEstimatorProps {
  itemName: string;
  metalType: MetalType;
  aiEstimate: {
    value: number;
    unit: WeightUnit;
    confidence: 'high' | 'medium' | 'low';
  };
  onWeightChange: (weight: number, unit: WeightUnit, source: 'ai' | 'calculated' | 'manual') => void;
  className?: string;
}

type EstimationMethod = 'ai' | 'calculate' | 'manual';
type ShapeType = 'pipe' | 'plate' | 'beam' | 'wire' | 'solid';

const CONFIDENCE_COLORS = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600',
};

export function WeightEstimator({
  itemName,
  metalType,
  aiEstimate,
  onWeightChange,
  className,
}: WeightEstimatorProps) {
  const [method, setMethod] = useState<EstimationMethod>('ai');
  const [manualWeight, setManualWeight] = useState<string>('');
  const [shape, setShape] = useState<ShapeType>('pipe');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [dimensions, setDimensions] = useState<WeightDimensions>({
    length: undefined,
    width: undefined,
    height: undefined,
    diameter: undefined,
    wallThickness: undefined,
    quantity: 1,
  });

  // Get relevant presets for the metal type
  const presets = useMemo(() => {
    return COMMON_WEIGHTS_PER_FOOT.filter(p => p.metalType === metalType);
  }, [metalType]);

  // Calculate weight from dimensions
  const calculatedWeight = useMemo(() => {
    if (!dimensions.length) return null;
    
    // If using a preset
    if (selectedPreset && shape === 'beam') {
      const preset = presets.find(p => 
        p.sizes.some(s => s.size === selectedPreset)
      );
      if (preset) {
        const sizeInfo = preset.sizes.find(s => s.size === selectedPreset);
        if (sizeInfo) {
          return sizeInfo.weightPerFoot * (dimensions.length || 0);
        }
      }
    }

    // Calculate from dimensions
    return calculateWeight(metalType, dimensions, shape);
  }, [dimensions, metalType, shape, selectedPreset, presets]);

  // Handle method change
  const handleMethodChange = useCallback((newMethod: EstimationMethod) => {
    setMethod(newMethod);
    
    if (newMethod === 'ai') {
      onWeightChange(aiEstimate.value, aiEstimate.unit, 'ai');
    } else if (newMethod === 'calculate' && calculatedWeight) {
      onWeightChange(calculatedWeight, 'lbs', 'calculated');
    } else if (newMethod === 'manual' && manualWeight) {
      onWeightChange(parseFloat(manualWeight), 'lbs', 'manual');
    }
  }, [aiEstimate, calculatedWeight, manualWeight, onWeightChange]);

  // Handle dimension change
  const handleDimensionChange = (key: keyof WeightDimensions, value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    const newDimensions = { ...dimensions, [key]: numValue };
    setDimensions(newDimensions);
  };

  // Apply calculated weight
  const applyCalculatedWeight = () => {
    if (calculatedWeight) {
      onWeightChange(calculatedWeight, 'lbs', 'calculated');
    }
  };

  // Apply manual weight
  const applyManualWeight = () => {
    if (manualWeight) {
      onWeightChange(parseFloat(manualWeight), 'lbs', 'manual');
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="w-4 h-4 text-primary" />
          Weight Estimation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Item Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Material:</span>
          <Badge variant="secondary" className="capitalize">
            {metalType}
          </Badge>
        </div>

        <Separator />

        {/* Estimation Method Selection */}
        <RadioGroup 
          value={method} 
          onValueChange={(v) => handleMethodChange(v as EstimationMethod)}
          className="space-y-3"
        >
          {/* AI Estimate Option */}
          <div className={cn(
            "flex items-start gap-3 p-3 rounded-lg border transition-colors",
            method === 'ai' ? "border-primary bg-primary/5" : "border-muted"
          )}>
            <RadioGroupItem value="ai" id="ai-estimate" className="mt-0.5" />
            <div className="flex-1 space-y-1">
              <Label 
                htmlFor="ai-estimate" 
                className="flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Visual AI Estimate</span>
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px]", CONFIDENCE_COLORS[aiEstimate.confidence])}
                >
                  {aiEstimate.confidence}
                </Badge>
              </Label>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {aiEstimate.value.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {aiEstimate.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Calculate from Dimensions Option */}
          <div className={cn(
            "flex items-start gap-3 p-3 rounded-lg border transition-colors",
            method === 'calculate' ? "border-primary bg-primary/5" : "border-muted"
          )}>
            <RadioGroupItem value="calculate" id="calculate" className="mt-0.5" />
            <div className="flex-1 space-y-3">
              <Label 
                htmlFor="calculate" 
                className="flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate from Dimensions</span>
              </Label>
              
              {method === 'calculate' && (
                <div className="space-y-3 pt-2">
                  {/* Shape Selection */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Shape</Label>
                      <Select value={shape} onValueChange={(v) => setShape(v as ShapeType)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pipe">Pipe/Tube</SelectItem>
                          <SelectItem value="plate">Plate/Sheet</SelectItem>
                          <SelectItem value="beam">Beam/Channel</SelectItem>
                          <SelectItem value="wire">Wire/Cable</SelectItem>
                          <SelectItem value="solid">Solid Block</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Preset Selection for beams */}
                    {shape === 'beam' && presets.length > 0 && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Size Preset</Label>
                        <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {presets.map(preset => (
                              <React.Fragment key={preset.itemType}>
                                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                  {preset.itemType}
                                </div>
                                {preset.sizes.map(size => (
                                  <SelectItem key={size.size} value={size.size}>
                                    {size.size} ({size.weightPerFoot} lb/ft)
                                  </SelectItem>
                                ))}
                              </React.Fragment>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Dimension Inputs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        Length (ft)
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={dimensions.length || ''}
                        onChange={(e) => handleDimensionChange('length', e.target.value)}
                        className="h-8"
                      />
                    </div>

                    {(shape === 'pipe' || shape === 'wire') && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Diameter (in)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            step="0.01"
                            value={dimensions.diameter || ''}
                            onChange={(e) => handleDimensionChange('diameter', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        {shape === 'pipe' && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">Wall Thickness (in)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              step="0.001"
                              value={dimensions.wallThickness || ''}
                              onChange={(e) => handleDimensionChange('wallThickness', e.target.value)}
                              className="h-8"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {(shape === 'plate' || shape === 'solid') && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Width ({shape === 'plate' ? 'ft' : 'in'})</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={dimensions.width || ''}
                            onChange={(e) => handleDimensionChange('width', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Thickness (in)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            step="0.01"
                            value={dimensions.height || ''}
                            onChange={(e) => handleDimensionChange('height', e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Calculated Result */}
                  {calculatedWeight !== null && calculatedWeight > 0 && (
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">Calculated Weight:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {calculatedWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })} lbs
                        </span>
                        <Button size="sm" onClick={applyCalculatedWeight} className="h-7">
                          <Check className="w-3 h-3 mr-1" />
                          Use
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Manual Override Option */}
          <div className={cn(
            "flex items-start gap-3 p-3 rounded-lg border transition-colors",
            method === 'manual' ? "border-primary bg-primary/5" : "border-muted"
          )}>
            <RadioGroupItem value="manual" id="manual" className="mt-0.5" />
            <div className="flex-1 space-y-2">
              <Label 
                htmlFor="manual" 
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Manual Override</span>
              </Label>
              
              {method === 'manual' && (
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    type="number"
                    placeholder="Enter weight"
                    value={manualWeight}
                    onChange={(e) => setManualWeight(e.target.value)}
                    className="h-8 w-32"
                  />
                  <span className="text-sm text-muted-foreground">lbs</span>
                  {manualWeight && (
                    <Button size="sm" onClick={applyManualWeight} className="h-7">
                      <Check className="w-3 h-3 mr-1" />
                      Apply
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </RadioGroup>

        {/* Material Density Reference */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <span className="font-medium capitalize">{metalType}</span> density: {MATERIAL_DENSITIES[metalType]} lb/cu.in
        </div>
      </CardContent>
    </Card>
  );
}
