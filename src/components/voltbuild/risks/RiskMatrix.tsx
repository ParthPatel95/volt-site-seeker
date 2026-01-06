import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { RiskMatrixCell, EnhancedRisk } from './types/voltbuild-risks.types';
import { getRiskLevelColor, PROBABILITY_CONFIG, IMPACT_CONFIG } from './types/voltbuild-risks.types';
import { cn } from '@/lib/utils';

interface RiskMatrixProps {
  matrix: RiskMatrixCell[][];
  onCellClick?: (risks: EnhancedRisk[]) => void;
  selectedCell?: { probability: string; impact: string } | null;
}

export function RiskMatrix({ matrix, onCellClick, selectedCell }: RiskMatrixProps) {
  const getCellBackground = (level: string, hasRisks: boolean) => {
    const baseOpacity = hasRisks ? '40' : '20';
    switch (level) {
      case 'low': return `bg-green-500/${baseOpacity}`;
      case 'moderate': return `bg-yellow-500/${baseOpacity}`;
      case 'significant': return `bg-orange-500/${baseOpacity}`;
      case 'critical': return `bg-red-500/${baseOpacity}`;
      default: return 'bg-muted/20';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Risk Assessment Matrix
          <Badge variant="outline" className="ml-auto font-normal">
            Click cell to filter
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Header row - Probability labels */}
            <div className="flex">
              <div className="w-20 shrink-0" />
              {['Low', 'Medium', 'High', 'Very High'].map((label) => (
                <div key={label} className="flex-1 text-center text-xs font-medium text-muted-foreground px-1">
                  {label}
                </div>
              ))}
            </div>

            {/* Matrix grid */}
            <div className="flex flex-col gap-1 mt-2">
              {matrix.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                  {/* Impact label */}
                  <div className="w-20 shrink-0 flex items-center justify-end pr-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {IMPACT_CONFIG[row[0].impact].label}
                    </span>
                  </div>

                  {/* Cells */}
                  {row.map((cell, colIndex) => {
                    const isSelected = selectedCell?.probability === cell.probability && 
                                       selectedCell?.impact === cell.impact;
                    
                    return (
                      <TooltipProvider key={`${rowIndex}-${colIndex}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onCellClick?.(cell.risks)}
                              className={cn(
                                'flex-1 aspect-square min-h-[60px] rounded-md transition-all',
                                'flex items-center justify-center',
                                'hover:ring-2 hover:ring-primary hover:ring-offset-2',
                                getCellBackground(cell.level, cell.risks.length > 0),
                                isSelected && 'ring-2 ring-primary ring-offset-2'
                              )}
                            >
                              {cell.risks.length > 0 ? (
                                <div className="flex flex-col items-center">
                                  <span className={cn(
                                    'text-lg font-bold',
                                    cell.level === 'critical' && 'text-red-600 dark:text-red-400',
                                    cell.level === 'significant' && 'text-orange-600 dark:text-orange-400',
                                    cell.level === 'moderate' && 'text-yellow-600 dark:text-yellow-400',
                                    cell.level === 'low' && 'text-green-600 dark:text-green-400'
                                  )}>
                                    {cell.risks.length}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    risk{cell.risks.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">—</span>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <div className="text-sm">
                              <p className="font-medium">
                                {PROBABILITY_CONFIG[cell.probability].label} Probability / {IMPACT_CONFIG[cell.impact].label} Impact
                              </p>
                              <p className="text-muted-foreground">
                                Score: {cell.score} ({cell.level})
                              </p>
                              {cell.risks.length > 0 && (
                                <ul className="mt-1 text-xs">
                                  {cell.risks.slice(0, 3).map(risk => (
                                    <li key={risk.id} className="truncate">• {risk.title}</li>
                                  ))}
                                  {cell.risks.length > 3 && (
                                    <li className="text-muted-foreground">
                                      +{cell.risks.length - 3} more
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Axis labels */}
            <div className="flex mt-3">
              <div className="w-20 shrink-0" />
              <div className="flex-1 text-center text-xs text-muted-foreground font-medium">
                Probability →
              </div>
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground font-medium hidden">
              ← Impact
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-green-500/30" />
                <span>Low (1-2)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-yellow-500/30" />
                <span>Moderate (3-6)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-orange-500/30" />
                <span>Significant (8-9)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-red-500/30" />
                <span>Critical (12-16)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
