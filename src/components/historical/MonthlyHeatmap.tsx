import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import { MonthlyHeatmapData } from '@/utils/aggregations';

interface Props {
  data: MonthlyHeatmapData[];
  unit: 'mwh' | 'kwh';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function MonthlyHeatmap({ data, unit }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Monthly Price Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Get unique years
  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);

  // Get min/max for color scale
  const prices = data.map(d => d.avgPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const getColor = (price: number) => {
    const normalized = (price - minPrice) / (maxPrice - minPrice);
    
    // Colorblind-safe gradient: blue (low) -> yellow (medium) -> orange (high)
    if (normalized < 0.33) {
      const t = normalized / 0.33;
      return `rgb(${Math.round(33 + t * 182)}, ${Math.round(102 + t * 118)}, ${Math.round(172 - t * 52)})`;
    } else if (normalized < 0.67) {
      const t = (normalized - 0.33) / 0.34;
      return `rgb(${Math.round(215 + t * 40)}, ${Math.round(220 - t * 85)}, ${Math.round(120 - t * 35)})`;
    } else {
      const t = (normalized - 0.67) / 0.33;
      return `rgb(255, ${Math.round(135 - t * 55)}, ${Math.round(85 - t * 45)})`;
    }
  };

  const formatPrice = (value: number) => {
    if (unit === 'kwh') {
      return `${(value * 0.1).toFixed(2)}¢`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Build matrix
  const matrix: Record<number, Record<number, MonthlyHeatmapData | null>> = {};
  for (const year of years) {
    matrix[year] = {};
    for (let month = 0; month < 12; month++) {
      matrix[year][month] = null;
    }
  }

  for (const point of data) {
    matrix[point.year][point.month] = point;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-600" />
          Monthly Price Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 text-xs">
              <span className="text-muted-foreground">Price Range:</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 rounded" style={{ backgroundColor: getColor(minPrice) }} />
                <span>{formatPrice(minPrice)}</span>
              </div>
              <div className="flex-1 h-4 rounded" style={{
                background: `linear-gradient(to right, ${getColor(minPrice)}, ${getColor((minPrice + maxPrice) / 2)}, ${getColor(maxPrice)})`
              }} />
              <div className="flex items-center gap-2">
                <span>{formatPrice(maxPrice)}</span>
                <div className="w-8 h-4 rounded" style={{ backgroundColor: getColor(maxPrice) }} />
              </div>
            </div>

            {/* Heatmap */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(12, 1fr)` }}>
              {/* Header row */}
              <div className="font-medium text-xs text-muted-foreground"></div>
              {MONTHS.map(month => (
                <div key={month} className="text-center text-xs font-medium text-muted-foreground">
                  {month}
                </div>
              ))}

              {/* Data rows */}
              {years.map(year => (
                <React.Fragment key={year}>
                  <div className="text-xs font-medium text-muted-foreground flex items-center">
                    {year}
                  </div>
                  {MONTHS.map((_, monthIdx) => {
                    const cell = matrix[year][monthIdx];
                    return (
                      <div
                        key={monthIdx}
                        className="aspect-square rounded border border-border/50 flex items-center justify-center text-xs font-medium cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        style={{
                          backgroundColor: cell ? getColor(cell.avgPrice) : 'hsl(var(--muted))',
                          color: cell ? '#fff' : 'hsl(var(--muted-foreground))',
                        }}
                        title={cell ? `${MONTHS[monthIdx]} ${year}: ${formatPrice(cell.avgPrice)}` : 'No data'}
                      >
                        {cell ? formatPrice(cell.avgPrice).replace('$', '').replace('¢', '') : '—'}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
