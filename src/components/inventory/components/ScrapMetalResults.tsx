import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scale, 
  DollarSign, 
  Recycle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { ScrapAnalysis, MetalType } from '../types/demolition.types';
import { cn } from '@/lib/utils';

interface ScrapMetalResultsProps {
  scrapAnalysis: ScrapAnalysis;
  className?: string;
}

const METAL_TYPE_LABELS: Record<MetalType, { label: string; color: string }> = {
  copper: { label: 'Copper', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  aluminum: { label: 'Aluminum', color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
  steel: { label: 'Steel', color: 'bg-slate-500/10 text-slate-600 border-slate-200' },
  brass: { label: 'Brass', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  stainless: { label: 'Stainless Steel', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  iron: { label: 'Iron', color: 'bg-stone-500/10 text-stone-600 border-stone-200' },
  mixed: { label: 'Mixed Metals', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  unknown: { label: 'Unknown', color: 'bg-muted text-muted-foreground' },
};

const CONFIDENCE_CONFIG = {
  high: { label: 'High', color: 'text-green-600', bgColor: 'bg-green-500' },
  medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
  low: { label: 'Low', color: 'text-red-600', bgColor: 'bg-red-500' },
};

export function ScrapMetalResults({ scrapAnalysis, className }: ScrapMetalResultsProps) {
  const metalConfig = METAL_TYPE_LABELS[scrapAnalysis.metalType];
  const weightConfidence = CONFIDENCE_CONFIG[scrapAnalysis.estimatedWeight.confidence];
  
  // Calculate price range
  const lowValue = scrapAnalysis.estimatedWeight.value * scrapAnalysis.scrapValue.pricePerUnit * 0.9;
  const highValue = scrapAnalysis.estimatedWeight.value * scrapAnalysis.scrapValue.pricePerUnit * 1.1;
  
  // Recovery rate estimate based on metal type
  const getRecoveryRate = (type: MetalType): number => {
    switch (type) {
      case 'copper': return 0.85;
      case 'aluminum': return 0.90;
      case 'brass': return 0.80;
      case 'stainless': return 0.85;
      case 'steel':
      case 'iron': return 0.95;
      default: return 0.75;
    }
  };
  
  const recoveryRate = getRecoveryRate(scrapAnalysis.metalType);
  const afterProcessingLow = lowValue * recoveryRate;
  const afterProcessingHigh = highValue * recoveryRate;

  return (
    <Card className={cn("border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-600" />
          <span>Scrap Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metal Type & Grade */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Metal Type</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("capitalize", metalConfig.color)}>
              {metalConfig.label}
            </Badge>
            {scrapAnalysis.metalGrade && (
              <span className="text-sm font-medium">({scrapAnalysis.metalGrade})</span>
            )}
          </div>
        </div>

        {/* Weight Estimate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Weight</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">
                {scrapAnalysis.estimatedWeight.value.toLocaleString()}
              </span>
              <span className="text-muted-foreground">{scrapAnalysis.estimatedWeight.unit}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Weight Confidence</span>
            <span className={weightConfidence.color}>{weightConfidence.label}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full", weightConfidence.bgColor)}
              style={{ width: scrapAnalysis.estimatedWeight.confidence === 'high' ? '100%' : scrapAnalysis.estimatedWeight.confidence === 'medium' ? '66%' : '33%' }}
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-background/80 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span>Current Pricing</span>
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {scrapAnalysis.scrapValue.lastUpdated}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price per {scrapAnalysis.estimatedWeight.unit}:</span>
              <span className="font-medium">${scrapAnalysis.scrapValue.pricePerUnit.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gross Value:</span>
              <span className="font-medium">
                ${lowValue.toFixed(2)} - ${highValue.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium">After Processing:</span>
              </div>
              <span className="font-bold text-green-600">
                ${afterProcessingLow.toFixed(0)} - ${afterProcessingHigh.toFixed(0)}
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground">
              ({Math.round(recoveryRate * 100)}% recovery rate for {metalConfig.label.toLowerCase()})
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground italic">
            Source: {scrapAnalysis.scrapValue.priceSource}
          </p>
        </div>

        {/* Recyclability Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <Recycle className="w-4 h-4 text-green-600" />
              <span className="text-muted-foreground">Recyclability</span>
            </span>
            <span className={cn(
              "font-medium",
              scrapAnalysis.recyclabilityScore >= 80 ? "text-green-600" :
              scrapAnalysis.recyclabilityScore >= 50 ? "text-yellow-600" : "text-red-600"
            )}>
              {scrapAnalysis.recyclabilityScore}/100
              <span className="text-xs ml-1">
                ({scrapAnalysis.recyclabilityScore >= 80 ? 'Excellent' : 
                  scrapAnalysis.recyclabilityScore >= 50 ? 'Good' : 'Fair'})
              </span>
            </span>
          </div>
          <Progress 
            value={scrapAnalysis.recyclabilityScore} 
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
