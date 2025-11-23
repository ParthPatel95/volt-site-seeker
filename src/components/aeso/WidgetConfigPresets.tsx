import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Activity, PieChart, Gauge, BarChart3, LineChart, Zap, Wind, Sun } from 'lucide-react';

interface WidgetPreset {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: React.ComponentType<any>;
  category: string;
  dataSource: string;
  config: any;
  filters?: any;
  width?: number;
  height?: number;
}

const WIDGET_PRESETS: WidgetPreset[] = [
  {
    id: 'price-overview',
    name: 'Pool Price Overview',
    description: 'Current pool price with 24h trend',
    type: 'stat_card',
    icon: TrendingUp,
    category: 'Pricing',
    dataSource: 'historical_pricing',
    config: {
      title: 'Current Pool Price',
      showTrend: true,
      showChange: true,
    },
    width: 4,
    height: 3,
  },
  {
    id: 'price-chart',
    name: 'Price Trend Chart',
    description: 'Historical price trends over time',
    type: 'line_chart',
    icon: LineChart,
    category: 'Pricing',
    dataSource: 'historical_pricing',
    config: {
      title: 'Pool Price History',
      showLegend: true,
      showGrid: true,
    },
    width: 8,
    height: 4,
  },
  {
    id: 'prediction-chart',
    name: 'Price Predictions',
    description: 'AI-powered price forecasts',
    type: 'line_chart',
    icon: Activity,
    category: 'Forecasting',
    dataSource: 'predictions',
    config: {
      title: 'Price Predictions',
      showConfidenceInterval: true,
      showLegend: true,
    },
    width: 8,
    height: 4,
  },
  {
    id: 'generation-mix',
    name: 'Generation Mix',
    description: 'Breakdown by fuel source',
    type: 'pie_chart',
    icon: PieChart,
    category: 'Generation',
    dataSource: 'generation',
    config: {
      title: 'Generation by Source',
      showPercentages: true,
      showLegend: true,
    },
    width: 6,
    height: 4,
  },
  {
    id: 'wind-generation',
    name: 'Wind Generation',
    description: 'Real-time wind power output',
    type: 'gauge',
    icon: Wind,
    category: 'Generation',
    dataSource: 'generation',
    config: {
      title: 'Wind Generation',
      metric: 'generation_wind',
      unit: 'MW',
      maxValue: 3000,
    },
    width: 4,
    height: 3,
  },
  {
    id: 'solar-generation',
    name: 'Solar Generation',
    description: 'Real-time solar power output',
    type: 'gauge',
    icon: Sun,
    category: 'Generation',
    dataSource: 'generation',
    config: {
      title: 'Solar Generation',
      metric: 'generation_solar',
      unit: 'MW',
      maxValue: 1000,
    },
    width: 4,
    height: 3,
  },
  {
    id: 'system-load',
    name: 'System Load',
    description: 'Current system demand',
    type: 'stat_card',
    icon: Zap,
    category: 'Operations',
    dataSource: 'market_data',
    config: {
      title: 'System Load',
      metric: 'ail_mw',
      unit: 'MW',
      showTrend: true,
    },
    width: 4,
    height: 3,
  },
  {
    id: 'load-trend',
    name: 'Load Trend',
    description: 'Historical system load',
    type: 'area_chart',
    icon: BarChart3,
    category: 'Operations',
    dataSource: 'market_data',
    config: {
      title: 'System Load Trend',
      showGrid: true,
      fillOpacity: 0.3,
    },
    width: 8,
    height: 4,
  },
  {
    id: 'model-accuracy',
    name: 'Model Accuracy',
    description: 'Prediction accuracy metrics',
    type: 'stat_card',
    icon: Activity,
    category: 'Analytics',
    dataSource: 'analytics',
    config: {
      title: 'Model Accuracy',
      metric: 'smape',
      unit: '%',
      invertValue: true,
    },
    width: 4,
    height: 3,
  },
];

const CATEGORIES = ['All', 'Pricing', 'Forecasting', 'Generation', 'Operations', 'Analytics'];

interface WidgetConfigPresetsProps {
  onSelectPreset: (preset: WidgetPreset) => void;
}

export function WidgetConfigPresets({ onSelectPreset }: WidgetConfigPresetsProps) {
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPresets = selectedCategory === 'All'
    ? WIDGET_PRESETS
    : WIDGET_PRESETS.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Presets Grid */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-2 pr-4">
          {filteredPresets.map(preset => {
            const Icon = preset.icon;
            return (
              <Card
                key={preset.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onSelectPreset(preset)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {preset.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// Add React import at the top
import React from 'react';
