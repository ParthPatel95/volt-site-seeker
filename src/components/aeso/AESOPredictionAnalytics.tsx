import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Calendar, CloudSun, Zap } from "lucide-react";
import { PricePrediction } from "@/hooks/useAESOPricePrediction";

interface AESOPredictionAnalyticsProps {
  predictions: PricePrediction[];
}

export const AESOPredictionAnalytics = ({ predictions }: AESOPredictionAnalyticsProps) => {
  if (!predictions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No prediction data available</p>
        </CardContent>
      </Card>
    );
  }

  // Hourly pattern analysis
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourPredictions = predictions.filter(p => new Date(p.timestamp).getHours() === hour);
    const avgPrice = hourPredictions.length > 0
      ? hourPredictions.reduce((sum, p) => sum + p.price, 0) / hourPredictions.length
      : 0;
    return { hour, avgPrice };
  });

  // Day of week analysis
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = dayNames.map((day, idx) => {
    const dayPredictions = predictions.filter(p => new Date(p.timestamp).getDay() === idx);
    const avgPrice = dayPredictions.length > 0
      ? dayPredictions.reduce((sum, p) => sum + p.price, 0) / dayPredictions.length
      : 0;
    return { day, avgPrice };
  });

  // Weather impact correlation
  const weatherData = predictions.slice(0, 24).map(p => ({
    temp: p.features?.avgTemp || 0,
    wind: p.features?.windSpeed || 0,
    price: p.price
  }));

  const tempCorrelation = weatherData.map(d => ({ temp: d.temp.toFixed(0), price: d.price }));
  const windCorrelation = weatherData.map(d => ({ wind: d.wind.toFixed(0), price: d.price }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Advanced Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="temp">Temperature</TabsTrigger>
            <TabsTrigger value="wind">Wind</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Average Price by Hour of Day
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: '$/MWh', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="avgPrice" name="Avg Price">
                  {hourlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avgPrice > 80 ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Average Price by Day of Week
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: '$/MWh', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="avgPrice" name="Avg Price" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="temp" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CloudSun className="h-4 w-4" />
              Price vs Temperature Correlation
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tempCorrelation.slice(0, 12)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="temp" label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: '$/MWh', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="price" name="Price" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="wind" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              Price vs Wind Speed Correlation
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={windCorrelation.slice(0, 12)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="wind" label={{ value: 'Wind Speed (km/h)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: '$/MWh', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="price" name="Price" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
