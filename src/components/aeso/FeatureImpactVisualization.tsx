import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ThermometerSun, Wind, Cloud, Calendar, Clock, Zap } from 'lucide-react';
import { PricePrediction } from '@/hooks/useAESOPricePrediction';

interface FeatureImpactVisualizationProps {
  prediction?: PricePrediction;
}

export const FeatureImpactVisualization = ({ prediction }: FeatureImpactVisualizationProps) => {
  if (!prediction || !prediction.features) {
    return null;
  }

  const features = prediction.features;
  
  // Provide defaults for any undefined features
  const avgTemp = features.avgTemp ?? 15;
  const windSpeed = features.windSpeed ?? 0;
  const cloudCover = features.cloudCover ?? 50;
  const hour = features.hour ?? 12;
  const isWeekend = features.isWeekend ?? false;
  const isHoliday = features.isHoliday ?? false;

  // Calculate feature impacts (normalized)
  const featureData = [
    { 
      name: 'Temperature', 
      impact: Math.abs(avgTemp - 15) * 2, // Deviation from comfort temp
      icon: ThermometerSun,
      value: `${avgTemp.toFixed(1)}°C`,
      color: avgTemp > 25 || avgTemp < -10 ? '#ef4444' : '#22c55e'
    },
    { 
      name: 'Wind Speed', 
      impact: windSpeed * 3, // Higher wind = more renewable
      icon: Wind,
      value: `${windSpeed.toFixed(1)} m/s`,
      color: windSpeed > 15 ? '#22c55e' : '#f59e0b'
    },
    { 
      name: 'Cloud Cover', 
      impact: (cloudCover / 100) * 50,
      icon: Cloud,
      value: `${cloudCover.toFixed(0)}%`,
      color: cloudCover > 80 ? '#ef4444' : '#22c55e'
    },
    { 
      name: 'Hour of Day', 
      impact: hour >= 17 && hour <= 20 ? 80 : 40, // Peak hours
      icon: Clock,
      value: `${hour}:00`,
      color: hour >= 17 && hour <= 20 ? '#ef4444' : '#22c55e'
    },
    { 
      name: 'Day Type', 
      impact: isWeekend || isHoliday ? 30 : 60,
      icon: Calendar,
      value: isWeekend ? 'Weekend' : isHoliday ? 'Holiday' : 'Weekday',
      color: isWeekend || isHoliday ? '#22c55e' : '#ef4444'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Driving Factors</CardTitle>
        <CardDescription>
          Real-time impact analysis of market conditions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Factor Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {featureData.map((feature) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.name}
                className="p-3 rounded-lg border"
                style={{ backgroundColor: `${feature.color}10` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color: feature.color }} />
                  <span className="text-xs font-medium">{feature.name}</span>
                </div>
                <div className="text-lg font-bold">{feature.value}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Impact: {feature.impact.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Impact Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={featureData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Impact Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{payload[0].payload.name}</p>
                      <p className="text-sm">Value: {payload[0].payload.value}</p>
                      <p className="text-sm text-primary">
                        Impact: {payload[0].value?.toFixed(0)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="impact" radius={[8, 8, 0, 0]}>
              {featureData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Insights */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold">Key Insights:</h4>
          {isHoliday && (
            <div className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-success" />
              <span>Holiday: Lower demand expected, favorable for operations</span>
            </div>
          )}
          {hour >= 17 && hour <= 20 && (
            <div className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-destructive" />
              <span>Peak Hours: High demand period, prices typically elevated</span>
            </div>
          )}
          {windSpeed > 15 && (
            <div className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-success" />
              <span>High Wind: Abundant renewable generation may lower prices</span>
            </div>
          )}
          {(avgTemp > 25 || avgTemp < -10) && (
            <div className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-destructive" />
              <span>Extreme Temperature: Increased heating/cooling demand expected</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
