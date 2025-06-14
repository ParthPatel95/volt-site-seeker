
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Calculator,
  Search,
  RefreshCw,
  Activity,
  MapPin
} from 'lucide-react';

interface EnergyRate {
  price_per_mwh: number;
  timestamp: string;
  node_name: string;
  rate_type: string;
}

interface CostCalculation {
  utility_name: string;
  tariff_name: string;
  monthly_cost: number;
  annual_cost: number;
  cost_per_mwh: number;
  breakdown: any;
}

export function EnergyRateIntelligence() {
  const [currentRates, setCurrentRates] = useState<EnergyRate[]>([]);
  const [costCalculations, setCostCalculations] = useState<CostCalculation[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('ERCOT');
  const [powerRequirement, setPowerRequirement] = useState(10);
  const [consumption, setConsumption] = useState(7200); // 10MW * 24h * 30d
  const [location, setLocation] = useState('TX');
  const { toast } = useToast();

  const markets = [
    { code: 'ERCOT', name: 'Texas (ERCOT)', region: 'Texas' },
    { code: 'PJM', name: 'Eastern US (PJM)', region: 'Eastern US' },
    { code: 'CAISO', name: 'California (CAISO)', region: 'California' },
    { code: 'NYISO', name: 'New York (NYISO)', region: 'New York' }
  ];

  useEffect(() => {
    fetchCurrentRates();
  }, [selectedMarket]);

  const fetchCurrentRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('energy-rate-intelligence', {
        body: {
          action: 'fetch_current_rates',
          market_code: selectedMarket,
          location: { state: location }
        }
      });

      if (error) throw error;

      if (data?.success) {
        setCurrentRates(data.current_rates || []);
        toast({
          title: "Rates Updated",
          description: `Current energy rates for ${selectedMarket} have been refreshed.`
        });
      }
    } catch (error: any) {
      console.error('Error fetching rates:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch energy rates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEnergyCosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('energy-rate-intelligence', {
        body: {
          action: 'calculate_energy_costs',
          monthly_consumption_mwh: consumption,
          peak_demand_mw: powerRequirement,
          location: { state: location }
        }
      });

      if (error) throw error;

      if (data?.success) {
        setCostCalculations(data.calculations || []);
        toast({
          title: "Cost Analysis Complete",
          description: `Found ${data.calculations?.length || 0} utility rate options.`
        });
      }
    } catch (error: any) {
      console.error('Error calculating costs:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to calculate energy costs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getForecast = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('energy-rate-intelligence', {
        body: {
          action: 'get_market_forecast',
          market_code: selectedMarket,
          days: 7
        }
      });

      if (error) throw error;

      if (data?.success) {
        setForecast(data.forecast || []);
        toast({
          title: "Forecast Generated",
          description: `7-day price forecast for ${selectedMarket} is ready.`
        });
      }
    } catch (error: any) {
      console.error('Error getting forecast:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate forecast",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCurrentPrice = () => {
    if (currentRates.length === 0) return 0;
    return currentRates[0]?.price_per_mwh || 0;
  };

  const getAveragePrice = () => {
    if (currentRates.length === 0) return 0;
    return currentRates.reduce((sum, rate) => sum + rate.price_per_mwh, 0) / currentRates.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Energy Rate Intelligence</h1>
          <p className="text-muted-foreground">Real-time electricity pricing and cost analysis for power-intensive facilities</p>
        </div>
        <Button onClick={fetchCurrentRates} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Rates
        </Button>
      </div>

      {/* Market Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Market Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Energy Market</label>
              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {markets.map(market => (
                    <SelectItem key={market.code} value={market.code}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">State</label>
              <Input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                placeholder="TX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="current-rates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current-rates">Current Rates</TabsTrigger>
          <TabsTrigger value="cost-calculator">Cost Calculator</TabsTrigger>
          <TabsTrigger value="forecast">Price Forecast</TabsTrigger>
          <TabsTrigger value="rate-finder">Rate Finder</TabsTrigger>
        </TabsList>

        <TabsContent value="current-rates" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-2xl font-bold">${getCurrentPrice().toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per MWh</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">24h Average</p>
                    <p className="text-2xl font-bold">${getAveragePrice().toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per MWh</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Market</p>
                    <p className="text-2xl font-bold">{selectedMarket}</p>
                    <p className="text-xs text-muted-foreground">
                      {markets.find(m => m.code === selectedMarket)?.region}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Real-Time Rate Data</CardTitle>
            </CardHeader>
            <CardContent>
              {currentRates.length > 0 ? (
                <div className="space-y-2">
                  {currentRates.slice(0, 12).map((rate, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">
                          {new Date(rate.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {rate.node_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${rate.price_per_mwh.toFixed(2)}/MWh</div>
                        <Badge variant={rate.rate_type === 'real_time' ? 'default' : 'secondary'}>
                          {rate.rate_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rate data available. Click "Refresh Rates" to load current pricing.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Energy Cost Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Power Requirement (MW)</label>
                  <Input 
                    type="number" 
                    value={powerRequirement} 
                    onChange={(e) => setPowerRequirement(Number(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Monthly Consumption (MWh)</label>
                  <Input 
                    type="number" 
                    value={consumption} 
                    onChange={(e) => setConsumption(Number(e.target.value))}
                    min="1"
                  />
                </div>
              </div>
              <Button onClick={calculateEnergyCosts} disabled={loading} className="w-full">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Energy Costs
              </Button>
            </CardContent>
          </Card>

          {costCalculations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costCalculations.slice(0, 5).map((calc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{calc.utility_name}</h4>
                          <p className="text-sm text-muted-foreground">{calc.tariff_name}</p>
                        </div>
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          {index === 0 ? 'Best Rate' : `Option ${index + 1}`}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Monthly Cost</p>
                          <p className="font-bold text-lg">{formatCurrency(calc.monthly_cost)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Annual Cost</p>
                          <p className="font-bold">{formatCurrency(calc.annual_cost)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost per MWh</p>
                          <p className="font-bold">${calc.cost_per_mwh.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Price Forecast
                </div>
                <Button onClick={getForecast} disabled={loading} size="sm">
                  Generate Forecast
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {forecast.length > 0 ? (
                <div className="space-y-3">
                  {forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          Confidence: {(day.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${day.predicted_price.toFixed(2)}/MWh</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Click "Generate Forecast" to see price predictions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-finder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Best Rate Finder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Rate comparison and recommendation features coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
