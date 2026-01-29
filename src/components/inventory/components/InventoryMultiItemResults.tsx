import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  ChevronUp,
  Package,
  DollarSign,
  Check,
  Pencil,
  Loader2,
} from 'lucide-react';
import { AIAnalysisResult } from '../hooks/useInventoryAIAnalysis';
import { cn } from '@/lib/utils';

export interface MultiItemAnalysisResult {
  items: AIAnalysisResult[];
  totalItemsDetected: number;
}

interface InventoryMultiItemResultsProps {
  results: MultiItemAnalysisResult;
  imageUrl: string;
  onAddSelected: (items: AIAnalysisResult[], imageUrl: string) => void;
  onEditItem: (item: AIAnalysisResult, index: number) => void;
  onRetake: () => void;
  isAdding?: boolean;
}

const conditionColors: Record<string, string> = {
  new: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  good: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const confidenceColors: Record<string, string> = {
  high: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-red-600 dark:text-red-400',
};

export function InventoryMultiItemResults({
  results,
  imageUrl,
  onAddSelected,
  onEditItem,
  onRetake,
  isAdding = false,
}: InventoryMultiItemResultsProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(results.items.map((_, i) => i)) // All selected by default
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const selectAll = () => {
    setSelectedIndices(new Set(results.items.map((_, i) => i)));
  };

  const deselectAll = () => {
    setSelectedIndices(new Set());
  };

  const handleAddSelected = () => {
    const selectedItems = results.items.filter((_, i) => selectedIndices.has(i));
    onAddSelected(selectedItems, imageUrl);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalValue = results.items
    .filter((_, i) => selectedIndices.has(i))
    .reduce((sum, item) => {
      const midValue = (item.marketValue.lowEstimate + item.marketValue.highEstimate) / 2;
      return sum + midValue * item.quantity.count;
    }, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              Found {results.totalItemsDetected} Different Items
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedIndices.size} of {results.items.length} selected
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Est. Total Value</p>
            <p className="font-semibold text-primary">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            Deselect All
          </Button>
        </div>
      </div>

      {/* Item List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {results.items.map((item, index) => {
              const isSelected = selectedIndices.has(index);
              const isExpanded = expandedIndex === index;
              const midValue = (item.marketValue.lowEstimate + item.marketValue.highEstimate) / 2;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'border rounded-lg overflow-hidden transition-colors',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  {/* Item Summary Row */}
                  <div
                    className="p-3 flex items-center gap-3 cursor-pointer"
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(index)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.item.name}</span>
                        <Badge variant="secondary" className={conditionColors[item.condition]}>
                          {item.condition}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {item.item.brand && <span>{item.item.brand}</span>}
                        {item.item.brand && item.item.model && <span>•</span>}
                        {item.item.model && <span>{item.item.model}</span>}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">×{item.quantity.count}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <DollarSign className="w-3 h-3" />
                        <span>{formatCurrency(midValue)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditItem(item, index);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-1 border-t bg-muted/30 space-y-2 text-sm">
                          <p className="text-muted-foreground">{item.item.description}</p>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-muted-foreground">Category: </span>
                              <span>{item.category.suggested}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Unit: </span>
                              <span>{item.quantity.unit}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Value Range: </span>
                              <span>
                                {formatCurrency(item.marketValue.lowEstimate)} -{' '}
                                {formatCurrency(item.marketValue.highEstimate)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Confidence: </span>
                              <span className={confidenceColors[item.identificationConfidence]}>
                                {item.identificationConfidence}
                              </span>
                            </div>
                          </div>

                          {item.extractedText && (
                            <div className="text-xs space-y-1">
                              {item.extractedText.modelNumber && (
                                <p>
                                  <span className="text-muted-foreground">Model #: </span>
                                  {item.extractedText.modelNumber}
                                </p>
                              )}
                              {item.extractedText.serialNumber && (
                                <p>
                                  <span className="text-muted-foreground">Serial #: </span>
                                  {item.extractedText.serialNumber}
                                </p>
                              )}
                            </div>
                          )}

                          {item.marketValue.notes && (
                            <p className="text-xs text-muted-foreground italic">
                              {item.marketValue.notes}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t flex gap-3">
        <Button variant="outline" onClick={onRetake} className="flex-1" disabled={isAdding}>
          Retake
        </Button>
        <Button
          onClick={handleAddSelected}
          className="flex-1"
          disabled={selectedIndices.size === 0 || isAdding}
        >
          {isAdding ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Add {selectedIndices.size} Items
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
