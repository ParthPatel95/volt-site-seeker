import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Hash, 
  Tag, 
  DollarSign, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { AIAnalysisResult } from '../hooks/useInventoryAIAnalysis';
import { cn } from '@/lib/utils';

interface InventoryAIResultsProps {
  result: AIAnalysisResult;
  imageUrl?: string;
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

const CONFIDENCE_ICONS = {
  high: '🎯',
  medium: '📊',
  low: '❓',
};

export function InventoryAIResults({
  result,
  imageUrl,
  onAccept,
  onRetake,
}: InventoryAIResultsProps) {
  const midValue = (result.marketValue.lowEstimate + result.marketValue.highEstimate) / 2;
  const totalValue = midValue * result.quantity.count;

  return (
    <div className="p-4 space-y-4">
      {/* Header with Image */}
      <div className="flex gap-4">
        {imageUrl && (
          <div className="w-24 h-24 rounded-lg overflow-hidden border flex-shrink-0">
            <img src={imageUrl} alt="Captured item" className="w-full h-full object-cover" />
          </div>
        )}
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

      <Separator />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {/* Quantity */}
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <Hash className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-bold">{result.quantity.count}</p>
          <p className="text-xs text-muted-foreground">{result.quantity.unit}</p>
          <p className="text-xs mt-1">{CONFIDENCE_ICONS[result.quantity.confidence]}</p>
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
          <span className="ml-auto text-xs">
            {CONFIDENCE_ICONS[result.marketValue.confidence]} {result.marketValue.confidence} confidence
          </span>
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
          {result.category.alternatives.slice(0, 3).map((cat, i) => (
            <Badge key={cat} variant="outline" className="mr-1 text-xs">
              {cat}
            </Badge>
          ))}
        </div>
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
