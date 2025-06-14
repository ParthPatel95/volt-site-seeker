
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PowerForecast {
  id: string;
  company_id: string;
  forecast_date: string;
  predicted_consumption_mw: number;
  confidence_score: number;
  forecast_horizon_months: number;
  seasonal_factors: any;
  growth_assumptions: any;
  created_at: string;
  company?: {
    name: string;
    industry: string;
  };
}

export function PowerForecastingPanel() {
  const [forecasts, setForecasts] = useState<PowerForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('power_demand_forecasts')
        .select(`
          *,
          companies(name, industry)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForecasts(data || []);
    } catch (error) {
      console.error('Error loading forecasts:', error);
      toast({
        title: "Error",
        description: "Failed to load power forecasts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateForecasts = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to generate forecasts",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'generate_power_forecasts', 
          company_name: companyName.trim() 
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Forecasts Generated",
          description: `Generated ${data.forecasts_generated} power forecasts for ${companyName}`,
        });
        loadForecasts();
        setCompanyName('');
      }
    } catch (error: any) {
      console.error('Error generating forecasts:', error);
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate power forecasts",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const chartData = forecasts
    .filter(f => f.company?.name)
    .slice(0, 12)
    .map(f => ({
      month: new Date(f.forecast_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      power: f.predicted_consumption_mw,
      confidence: f.confidence_score,
      company: f.company?.name
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Power Demand Forecasting
          </h2>
          <p className="text-muted-foreground">
            AI-powered predictive modeling for corporate power consumption
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Power Forecasts</CardTitle>
          <CardDescription>
            Create 12-month power demand forecasts for any company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateForecasts()}
            />
            <Button onClick={generateForecasts} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Forecasts'}
              <TrendingUp className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Power Consumption Forecasts</CardTitle>
            <CardDescription>
              Predicted power demand over time with confidence intervals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'power' ? `${value} MW` : `${value}%`,
                    name === 'power' ? 'Power Consumption' : 'Confidence'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="power" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="power"
                />
                <Line 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="confidence"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading forecasts...</p>
        </div>
      ) : forecasts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Forecasts Generated
            </h3>
            <p className="text-muted-foreground">
              Generate power forecasts for a company to see predictions here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {forecasts.slice(0, 10).map((forecast) => (
            <Card key={forecast.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {forecast.company?.name || 'Unknown Company'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {forecast.predicted_consumption_mw} MW
                      </Badge>
                      <Badge variant={forecast.confidence_score > 70 ? "default" : "secondary"}>
                        {forecast.confidence_score}% confidence
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(forecast.forecast_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Seasonal Factors</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {forecast.seasonal_factors && Object.entries(forecast.seasonal_factors).map(([key, value]) => (
                        <div key={key}>
                          <span className="capitalize">{key.replace('_', ' ')}: </span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Growth Assumptions</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {forecast.growth_assumptions && Object.entries(forecast.growth_assumptions).map(([key, value]) => (
                        <div key={key}>
                          <span className="capitalize">{key.replace('_', ' ')}: </span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
