import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Hash, 
  Tag, 
  DollarSign, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  AlertCircle,
  TrendingUp,
  FileText,
  Eye,
  HardHat
} from 'lucide-react';
import { AIAnalysisResult } from '../hooks/useInventoryAIAnalysis';
import { ScrapMetalResults } from './ScrapMetalResults';
import { SalvageAssessment } from './SalvageAssessment';
import { HazmatWarning } from './HazmatWarning';
import { cn } from '@/lib/utils';

interface InventoryAIResultsProps {
  result: AIAnalysisResult;
  imageUrl?: string;
  allImages?: string[];
  onAccept: () => void;
  onRetake: () => void;
  existingCategories?: string[];
}

const CONDITION_COLORS = {
  new: 'bg-green-500/10 text-green-600 border-green-200',
  good: 'bg-blue-500/10 text-blue-600 border-blue-200',
  fair: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  poor: 'bg-red-500/10 text-red-600 border-red-200',
};

const CONFIDENCE_CONFIG = {
  high: { label: 'High', color: 'bg-green-500', percentage: 100 },
  medium: { label: 'Medium', color: 'bg-yellow-500', percentage: 66 },
  low: { label: 'Low', color: 'bg-red-500', percentage: 33 },
};

export function InventoryAIResults({
  result,
  imageUrl,
  allImages = [],
  onAccept,
  onRetake,
}: InventoryAIResultsProps) {
  const midValue = (result.marketValue.lowEstimate + result.marketValue.highEstimate) / 2;
  const totalValue = midValue * result.quantity.count;
  
  const identificationConfidence = result.identificationConfidence || result.quantity.confidence;
  const confidenceConfig = CONFIDENCE_CONFIG[identificationConfidence];

  return (
    <div className="p-4 space-y-4">
      {/* Header with Image(s) */}
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {allImages.length > 1 ? (
            <div className="relative">
              <div className="w-24 h-24 rounded-lg overflow-hidden border">
                <img src={imageUrl || allImages[0]} alt="Captured item" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {allImages.length}
              </div>
            </div>
          ) : imageUrl ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden border">
              <img src={imageUrl} alt="Captured item" className="w-full h-full object-cover" />
            </div>
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {result.item.name}
              </h3>
              {result.item.brand && (
                <p className="text-sm text-muted-foreground">
                  {result.item.brand} {result.item.model && `• ${result.item.model}`}
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {result.item.description}
          </p>
        </div>
      </div>

      {/* Identification Confidence Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Identification Confidence</span>
          <span className={cn(
            "font-medium",
            identificationConfidence === 'high' && "text-green-600",
            identificationConfidence === 'medium' && "text-yellow-600",
            identificationConfidence === 'low' && "text-red-600"
          )}>
            {confidenceConfig.label}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all", confidenceConfig.color)}
            style={{ width: `${confidenceConfig.percentage}%` }}
          />
        </div>
      </div>

      <Separator />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {/* Quantity */}
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <Hash className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-bold">{result.quantity.count}</p>
          <p className="text-xs text-muted-foreground">{result.quantity.unit}</p>
          <div className="mt-1">
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] px-1",
                result.quantity.confidence === 'high' && "border-green-300 text-green-600",
                result.quantity.confidence === 'medium' && "border-yellow-300 text-yellow-600",
                result.quantity.confidence === 'low' && "border-red-300 text-red-600"
              )}
            >
              {result.quantity.confidence}
            </Badge>
          </div>
        </div>

        {/* Condition */}
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <Package className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <Badge 
            variant="outline" 
            className={cn("mt-1 capitalize", CONDITION_COLORS[result.condition])}
          >
            {result.condition}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {result.marketValue.isUsed ? 'Used' : 'New'}
          </p>
        </div>

        {/* Category */}
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <Tag className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-sm font-medium truncate">{result.category.suggested}</p>
          <p className="text-xs text-muted-foreground">Category</p>
        </div>
      </div>

      <Separator />

      {/* Market Value Section */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-primary" />
          <span className="font-semibold">Estimated Market Value</span>
        </div>
        
        {/* Value Confidence Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Price Confidence</span>
            <span className={cn(
              "font-medium",
              result.marketValue.confidence === 'high' && "text-green-600",
              result.marketValue.confidence === 'medium' && "text-yellow-600",
              result.marketValue.confidence === 'low' && "text-red-600"
            )}>
              {CONFIDENCE_CONFIG[result.marketValue.confidence].label}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full", CONFIDENCE_CONFIG[result.marketValue.confidence].color)}
              style={{ width: `${CONFIDENCE_CONFIG[result.marketValue.confidence].percentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {/* Per Unit */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Per unit:</span>
            <span className="font-medium">
              ${result.marketValue.lowEstimate.toFixed(2)} - ${result.marketValue.highEstimate.toFixed(2)}
            </span>
          </div>

          {/* Total Value */}
          {result.quantity.count > 1 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Total ({result.quantity.count} {result.quantity.unit}):
              </span>
              <span className="text-lg font-bold text-primary">
                ~${totalValue.toFixed(2)}
              </span>
            </div>
          )}

          {/* Notes */}
          {result.marketValue.notes && (
            <div className="flex items-start gap-2 pt-2 mt-2 border-t">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">{result.marketValue.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Text Section */}
      {result.extractedText && (
        Object.values(result.extractedText).some(v => v && (Array.isArray(v) ? v.length > 0 : true)) && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>Detected Text</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {result.extractedText.modelNumber && (
                <div>
                  <span className="text-muted-foreground">Model: </span>
                  <code className="bg-background px-1.5 py-0.5 rounded">{result.extractedText.modelNumber}</code>
                </div>
              )}
              {result.extractedText.serialNumber && (
                <div>
                  <span className="text-muted-foreground">Serial: </span>
                  <code className="bg-background px-1.5 py-0.5 rounded">{result.extractedText.serialNumber}</code>
                </div>
              )}
              {result.extractedText.barcode && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Barcode: </span>
                  <code className="bg-background px-1.5 py-0.5 rounded">{result.extractedText.barcode}</code>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* Suggested SKU */}
      {result.item.suggestedSku && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Suggested SKU:</span>
          <code className="bg-muted px-2 py-0.5 rounded text-xs">
            {result.item.suggestedSku}
          </code>
        </div>
      )}

      {/* Alternative Categories */}
      {result.category.alternatives.length > 0 && (
        <div className="text-sm">
          <span className="text-muted-foreground">Also fits: </span>
          {result.category.alternatives.slice(0, 3).map((cat) => (
            <Badge key={cat} variant="outline" className="mr-1 text-xs">
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {/* Demolition Mode Section */}
      {(result.scrapAnalysis || result.salvageAssessment || result.hazmatFlags) && (
        <>
          <Separator />
          
          <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
            <HardHat className="w-4 h-4" />
            <span>Demolition Analysis</span>
          </div>
          
          {/* Hazmat Warning - Show first if present */}
          {result.hazmatFlags && (
            result.hazmatFlags.hasAsbestos || 
            result.hazmatFlags.hasLeadPaint || 
            result.hazmatFlags.hasPCBs || 
            result.hazmatFlags.hasRefrigerants ||
            (result.hazmatFlags.otherHazards && result.hazmatFlags.otherHazards.length > 0)
          ) && (
            <HazmatWarning hazmatFlags={result.hazmatFlags} />
          )}
          
          {/* Scrap Metal Analysis */}
          {result.scrapAnalysis && (
            <ScrapMetalResults scrapAnalysis={result.scrapAnalysis} />
          )}
          
          {/* Salvage Assessment */}
          {result.salvageAssessment && (
            <SalvageAssessment 
              salvageAssessment={result.salvageAssessment}
              scrapAnalysis={result.scrapAnalysis}
              itemName={result.item.name}
              condition={result.condition}
            />
          )}
          
          {/* Removal Details */}
          {result.demolitionDetails && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span>Removal Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Complexity: </span>
                  <Badge variant="outline" className="capitalize">
                    {result.demolitionDetails.removalComplexity}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Labor: </span>
                  <span className="font-medium">{result.demolitionDetails.laborHoursEstimate} hrs</span>
                </div>
                {result.demolitionDetails.equipmentNeeded?.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Equipment: </span>
                    <span>{result.demolitionDetails.equipmentNeeded.join(', ')}</span>
                  </div>
                )}
                {result.demolitionDetails.accessibilityNotes && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Notes: </span>
                    <span>{result.demolitionDetails.accessibilityNotes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onRetake} className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Retake
        </Button>
        <Button onClick={onAccept} className="flex-1">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Add to Inventory
        </Button>
      </div>
    </div>
  );
}
