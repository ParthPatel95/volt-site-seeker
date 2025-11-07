import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
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

  const chartData = predictions.map(pred => ({
    time: format(new Date(pred.timestamp), 'MMM dd HH:mm'),
    price: pred.price,
    lower: pred.confidenceLower,
    upper: pred.confidenceUpper,
    confidence: pred.confidenceScore * 100
  }));

  // Add current price as first point if available
  if (currentPrice) {
    chartData.unshift({
      time: 'Now',
      price: currentPrice,
      lower: currentPrice,
      upper: currentPrice,
      confidence: 100
    });
  }

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

        {/* Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Price ($/MWh)', angle: -90, position: 'insideLeft' }}
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{payload[0].payload.time}</p>
                      <p className="text-sm">
                        Price: <span className="font-bold">${payload[0].value?.toFixed(2)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Range: ${payload[0].payload.lower.toFixed(2)} - ${payload[0].payload.upper.toFixed(2)}
                      </p>
                      <p className="text-sm text-success">
                        Confidence: {payload[0].payload.confidence.toFixed(0)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              name="Upper Bound"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              name="Lower Bound"
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Predicted Price"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
