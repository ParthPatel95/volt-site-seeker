import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { PricePrediction } from '@/hooks/useAESOPricePrediction';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface PricePredictionChartProps {
  predictions: PricePrediction[];
  currentPrice?: number;
}

export const PricePredictionChart = ({ predictions, currentPrice }: PricePredictionChartProps) => {
  if (!predictions || predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Forecast</CardTitle>
          <CardDescription>No prediction data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const tableData = predictions.map(pred => ({
    timestamp: new Date(pred.timestamp),
    price: pred.price,
    lower: pred.confidenceLower,
    upper: pred.confidenceUpper,
    confidence: pred.confidenceScore * 100
  }));

  // Recharts wants a flat series. We compute `bandHeight` as upper - lower
  // and stack two areas: a transparent base (the lower bound) plus the
  // band height filled with our confidence colour. This is the standard
  // Recharts pattern for shaded confidence bands.
  const chartData = predictions.map(p => ({
    t: new Date(p.timestamp).getTime(),
    label: format(new Date(p.timestamp), 'HH:mm'),
    price: p.price,
    lower: p.confidenceLower,
    upper: p.confidenceUpper,
    bandBase: p.confidenceLower,
    bandHeight: Math.max(0, p.confidenceUpper - p.confidenceLower),
  }));

  // Calculate insights
  const avgPrediction = predictions.reduce((sum, p) => sum + p.price, 0) / predictions.length;
  const maxPrice = Math.max(...predictions.map(p => p.price));
  const minPrice = Math.min(...predictions.map(p => p.price));
  const peakTime = predictions.find(p => p.price === maxPrice);
  const lowTime = predictions.find(p => p.price === minPrice);

  const priceChange = currentPrice ? ((avgPrediction - currentPrice) / currentPrice) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Price Forecast - Next {predictions.length} Hours</span>
          <div className="flex items-center gap-2">
            {priceChange > 0 ? (
              <TrendingUp className="h-5 w-5 text-destructive" />
            ) : (
              <TrendingDown className="h-5 w-5 text-success" />
            )}
            <span className={priceChange > 0 ? "text-destructive" : "text-success"}>
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
        <CardDescription>
          AI-powered price predictions with confidence intervals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-accent/50">
            <div className="text-sm text-muted-foreground">Average Forecast</div>
            <div className="text-2xl font-bold">${avgPrediction.toFixed(2)}/MWh</div>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10">
            <div className="text-sm text-muted-foreground">Peak Expected</div>
            <div className="text-2xl font-bold">${maxPrice.toFixed(2)}/MWh</div>
            <div className="text-xs text-muted-foreground mt-1">
              {peakTime && format(new Date(peakTime.timestamp), 'MMM dd HH:mm')}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-success/10">
            <div className="text-sm text-muted-foreground">Low Expected</div>
            <div className="text-2xl font-bold">${minPrice.toFixed(2)}/MWh</div>
            <div className="text-xs text-muted-foreground mt-1">
              {lowTime && format(new Date(lowTime.timestamp), 'MMM dd HH:mm')}
            </div>
          </div>
        </div>

        {/* Price Spike Alert */}
        {maxPrice > 100 && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium">
              Price spike predicted: ${maxPrice.toFixed(2)}/MWh at {peakTime && format(new Date(peakTime.timestamp), 'HH:mm')}
            </span>
          </div>
        )}

        {/* Confidence-band chart. The shaded region is the model's
            confidence interval (typically the 95% CI); the line is the
            point forecast. Without this band a row of point estimates can
            look more precise than the model is. */}
        <div className="mb-6 h-64 -mx-2 sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="aiBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} width={48} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'lower' || name === 'upper') return [`$${value.toFixed(2)}/MWh`, name === 'lower' ? 'CI low' : 'CI high'];
                  if (name === 'price') return [`$${value.toFixed(2)}/MWh`, 'Forecast'];
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  const d = payload?.[0]?.payload as { t?: number } | undefined;
                  return d?.t ? format(new Date(d.t), 'MMM dd HH:mm') : label;
                }}
              />
              {/* Stacked invisible base + visible band so the upper bound = base + height. */}
              <Area type="monotone" dataKey="bandBase" stackId="ci" stroke="none" fill="transparent" />
              <Area type="monotone" dataKey="bandHeight" stackId="ci" stroke="none" fill="url(#aiBand)" name="Confidence band" />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name="Forecast"
              />
              {currentPrice !== undefined && (
                <ReferenceLine
                  y={currentPrice}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  label={{ value: `Current $${currentPrice.toFixed(0)}`, position: 'insideBottomRight', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Predicted Price</TableHead>
                <TableHead className="text-right">Range</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPrice && (
                <TableRow className="bg-accent/30 font-semibold">
                  <TableCell>Now</TableCell>
                  <TableCell>{format(new Date(), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="text-right">${currentPrice.toFixed(2)}/MWh</TableCell>
                  <TableCell className="text-right text-muted-foreground">-</TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              )}
              {tableData.map((row) => (
                <TableRow key={row.timestamp.toISOString()}>
                  <TableCell className="font-medium">{format(row.timestamp, 'HH:mm')}</TableCell>
                  <TableCell className="text-muted-foreground">{format(row.timestamp, 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${row.price.toFixed(2)}/MWh
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    ${row.lower.toFixed(2)} - ${row.upper.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={row.confidence >= 80 ? "text-success" : row.confidence >= 60 ? "text-warning" : "text-destructive"}>
                      {row.confidence.toFixed(0)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
