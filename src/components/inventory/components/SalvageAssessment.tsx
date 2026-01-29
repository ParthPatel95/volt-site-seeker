import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  DollarSign, 
  Recycle,
  Wrench,
  TrendingUp,
  Scale,
  Package
} from 'lucide-react';
import { SalvageAssessment as SalvageAssessmentType, ScrapAnalysis } from '../types/demolition.types';
import { cn } from '@/lib/utils';

interface SalvageAssessmentProps {
  salvageAssessment: SalvageAssessmentType;
  scrapAnalysis?: ScrapAnalysis;
  itemName: string;
  condition: string;
  onAddAsSalvage?: () => void;
  onAddAsScrap?: () => void;
  className?: string;
}

const DEMAND_CONFIG = {
  high: { label: 'High Demand', color: 'bg-green-500/10 text-green-600 border-green-200' },
  medium: { label: 'Medium Demand', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  low: { label: 'Low Demand', color: 'bg-red-500/10 text-red-600 border-red-200' },
};

const REFURB_CONFIG = {
  high: { label: 'High', color: 'text-green-600' },
  medium: { label: 'Medium', color: 'text-yellow-600' },
  low: { label: 'Low', color: 'text-orange-600' },
  none: { label: 'None', color: 'text-muted-foreground' },
};

const DISPOSITION_CONFIG = {
  resell: { label: 'Resell', icon: Package, color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  scrap: { label: 'Scrap', icon: Recycle, color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
  'hazmat-disposal': { label: 'Hazmat Disposal', icon: Scale, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
};

export function SalvageAssessment({
  salvageAssessment,
  scrapAnalysis,
  itemName,
  condition,
  onAddAsSalvage,
  onAddAsScrap,
  className,
}: SalvageAssessmentProps) {
  const dispositionConfig = DISPOSITION_CONFIG[salvageAssessment.recommendedDisposition];
  const DispositionIcon = dispositionConfig.icon;
  const demandConfig = DEMAND_CONFIG[salvageAssessment.demandLevel];
  const refurbConfig = REFURB_CONFIG[salvageAssessment.refurbishmentPotential];
  
  const salvageMidValue = (salvageAssessment.resaleValue.lowEstimate + salvageAssessment.resaleValue.highEstimate) / 2;
  const scrapValue = scrapAnalysis?.scrapValue.totalValue || 0;
  
  // Determine which is better value
  const salvageIsBetter = salvageAssessment.isSalvageable && salvageMidValue > scrapValue;

  return (
    <Card className={cn("border-blue-200/50 bg-blue-50/30 dark:bg-blue-900/10", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600" />
          <span>Disposition Recommendation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Item Info */}
        <div>
          <p className="font-medium">{itemName}</p>
          <p className="text-sm text-muted-foreground capitalize">
            Condition: {condition}
          </p>
        </div>

        {/* Recommendation Badge */}
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg border",
          dispositionConfig.bgColor
        )}>
          <DispositionIcon className={cn("w-5 h-5", dispositionConfig.color)} />
          <div>
            <p className={cn("font-semibold", dispositionConfig.color)}>
              Recommended: {dispositionConfig.label}
            </p>
            {salvageAssessment.recommendedDisposition === 'resell' && (
              <p className="text-xs text-muted-foreground">
                This item has good resale potential
              </p>
            )}
          </div>
        </div>

        {/* Value Comparison */}
        <div className="grid grid-cols-2 gap-3">
          {/* Salvage Option */}
          <div className={cn(
            "p-3 rounded-lg border-2 transition-all",
            salvageIsBetter 
              ? "border-green-300 bg-green-50/50 dark:bg-green-900/20" 
              : "border-muted bg-muted/30"
          )}>
            <div className="flex items-center gap-1.5 mb-2">
              <Package className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Salvage</span>
              {salvageIsBetter && (
                <Badge variant="outline" className="ml-auto text-[10px] bg-green-100 text-green-700 border-green-300">
                  Recommended
                </Badge>
              )}
            </div>
            {salvageAssessment.isSalvageable ? (
              <>
                <p className="text-lg font-bold text-green-600">
                  ${salvageAssessment.resaleValue.lowEstimate.toLocaleString()} - ${salvageAssessment.resaleValue.highEstimate.toLocaleString()}
                </p>
                <Badge variant="outline" className={cn("mt-2", demandConfig.color)}>
                  {demandConfig.label}
                </Badge>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Not salvageable</p>
            )}
          </div>

          {/* Scrap Option */}
          <div className={cn(
            "p-3 rounded-lg border-2 transition-all",
            !salvageIsBetter 
              ? "border-amber-300 bg-amber-50/50 dark:bg-amber-900/20" 
              : "border-muted bg-muted/30"
          )}>
            <div className="flex items-center gap-1.5 mb-2">
              <Recycle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">Scrap</span>
              {!salvageIsBetter && salvageAssessment.recommendedDisposition === 'scrap' && (
                <Badge variant="outline" className="ml-auto text-[10px] bg-amber-100 text-amber-700 border-amber-300">
                  Recommended
                </Badge>
              )}
            </div>
            {scrapAnalysis ? (
              <>
                <p className="text-lg font-bold text-amber-600">
                  ${scrapValue.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {scrapAnalysis.estimatedWeight.value} {scrapAnalysis.estimatedWeight.unit}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No scrap data</p>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {salvageAssessment.isSalvageable && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Refurb potential:</span>
              <span className={refurbConfig.color}>{refurbConfig.label}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(onAddAsSalvage || onAddAsScrap) && (
          <div className="flex gap-2 pt-2">
            {salvageAssessment.isSalvageable && onAddAsSalvage && (
              <Button 
                variant={salvageIsBetter ? "default" : "outline"}
                className="flex-1"
                onClick={onAddAsSalvage}
              >
                <Package className="w-4 h-4 mr-2" />
                Add as Salvage
              </Button>
            )}
            {onAddAsScrap && (
              <Button 
                variant={!salvageIsBetter ? "default" : "outline"}
                className="flex-1"
                onClick={onAddAsScrap}
              >
                <Recycle className="w-4 h-4 mr-2" />
                Add as Scrap
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
