import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Brain, 
  Target,
  AlertCircle,
  Clock
} from 'lucide-react';

interface PredictiveAnalyticsProps {
  predictions?: Array<{
    hour: number;
    predictedPrice: number;
    confidence: number;
  }>;
  patterns?: Array<{
    type: string;
    description: string;
    count?: number;
    threshold?: number;
  }>;
  currentPrice?: number;
}

export function PredictiveAnalytics({ predictions = [], patterns = [], currentPrice }: PredictiveAnalyticsProps) {
  const formatPredictionData = () => {
    const now = new Date();
    return predictions.map((pred, index) => {
      const futureTime = new Date(now.getTime() + (pred.hour * 60 * 60 * 1000));
      return {
        hour: pred.hour,
        time: futureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        predictedPrice: pred.predictedPrice,
        confidence: pred.confidence * 100, // Convert to percentage
        lowerBound: pred.predictedPrice * (1 - (1 - pred.confidence) * 0.5),
        upperBound: pred.predictedPrice * (1 + (1 - pred.confidence) * 0.5)
      };
    });
  };

  const predictionData = formatPredictionData();
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 80) return 'text-green-600';
    if (confidence > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'price_spikes':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'sustained_high':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPatternSeverity = (type: string, count?: number) => {
    if (type === 'price_spikes' && count && count > 5) return 'destructive';
    if (type === 'sustained_high') return 'secondary';
    return 'outline';
  };

  const formatCurrency = (value: number) => `CA$${value.toFixed(2)}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.time} (Hour {data.hour})</p>
          <p style={{ color: payload[0].color }}>
            Predicted: {formatCurrency(data.predictedPrice)}/MWh
          </p>
          <p className="text-sm text-muted-foreground">
            Confidence: {data.confidence.toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground">
            Range: {formatCurrency(data.lowerBound)} - {formatCurrency(data.upperBound)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Price Predictions Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            24-Hour Price Predictions
            <Badge variant="outline" className="ml-2">
              AI-Powered
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Machine learning predictions based on historical patterns and market conditions
          </p>
        </CardHeader>
        <CardContent>
          {predictionData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval={2}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    {/* Current price reference line */}
                    {currentPrice && (
                      <ReferenceLine 
                        y={currentPrice} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5" 
                        label="Current Price"
                      />
                    )}
                    
                    {/* Prediction line */}
                    <Line 
                      type="monotone" 
                      dataKey="predictedPrice" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Predicted Price"
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                    
                    {/* Confidence bounds */}
                    <Line 
                      type="monotone" 
                      dataKey="upperBound" 
                      stroke="#8b5cf6" 
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      name="Upper Bound"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lowerBound" 
                      stroke="#8b5cf6" 
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      name="Lower Bound"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Quick insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium">Next Hour</div>
                  <div className="text-lg font-bold">
                    {formatCurrency(predictionData[0]?.predictedPrice || 0)}/MWh
                  </div>
                  <div className={`text-xs ${getConfidenceColor(predictionData[0]?.confidence || 0)}`}>
                    {predictionData[0]?.confidence.toFixed(0)}% confidence
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium">Peak Predicted</div>
                  <div className="text-lg font-bold">
                    {formatCurrency(Math.max(...predictionData.map(d => d.predictedPrice)))}/MWh
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Hour {predictionData.find(d => d.predictedPrice === Math.max(...predictionData.map(p => p.predictedPrice)))?.hour}
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium">Low Predicted</div>
                  <div className="text-lg font-bold">
                    {formatCurrency(Math.min(...predictionData.map(d => d.predictedPrice)))}/MWh
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Hour {predictionData.find(d => d.predictedPrice === Math.min(...predictionData.map(p => p.predictedPrice)))?.hour}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Loading price predictions...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pattern Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Market Pattern Detection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Automated analysis of pricing patterns and market anomalies
          </p>
        </CardHeader>
        <CardContent>
          {patterns.length > 0 ? (
            <div className="space-y-3">
              {patterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPatternIcon(pattern.type)}
                    <div>
                      <div className="font-medium text-sm">
                        {pattern.description}
                      </div>
                      {pattern.threshold && (
                        <div className="text-xs text-muted-foreground">
                          Threshold: {formatCurrency(pattern.threshold)}/MWh
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={getPatternSeverity(pattern.type, pattern.count)}>
                    {pattern.count ? `${pattern.count} events` : 'Active'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No significant patterns detected</p>
              <p className="text-sm">Market conditions appear stable</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}