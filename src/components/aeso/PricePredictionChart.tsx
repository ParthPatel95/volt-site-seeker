import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { PricePrediction } from '@/hooks/useAESOPricePrediction';

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
