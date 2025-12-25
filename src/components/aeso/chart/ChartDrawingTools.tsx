import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Crosshair, 
  TrendingUp, 
  Minus, 
  Square,
  Type,
  Ruler,
  MousePointer2,
  Circle,
  Trash2
} from 'lucide-react';

interface ChartDrawingToolsProps {
  activeTool?: string;
  onToolChange?: (tool: string) => void;
  onClear?: () => void;
}

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'crosshair', icon: Crosshair, label: 'Crosshair' },
  { id: 'trendline', icon: TrendingUp, label: 'Trend Line' },
  { id: 'horizontal', icon: Minus, label: 'Horizontal Line' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'measure', icon: Ruler, label: 'Measure' },
  { id: 'text', icon: Type, label: 'Text' },
];

export function ChartDrawingTools({
  activeTool = 'crosshair',
  onToolChange,
  onClear
}: ChartDrawingToolsProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col items-center py-2 px-1 border-r border-border bg-muted/20 w-10">
        {TOOLS.map((tool, index) => (
          <React.Fragment key={tool.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`h-8 w-8 p-0 ${
                    activeTool === tool.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => onToolChange?.(tool.id)}
                >
                  <tool.icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">{tool.label}</p>
              </TooltipContent>
            </Tooltip>
            {index === 1 && <Separator className="my-1 w-6" />}
            {index === 5 && <Separator className="my-1 w-6" />}
          </React.Fragment>
        ))}
        
        <div className="flex-1" />
        
        {/* Clear */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={onClear}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-xs">Clear Drawings</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
