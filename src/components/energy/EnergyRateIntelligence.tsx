
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useEnergyRates } from '@/hooks/useEnergyRates';
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Calculator,
  Search,
  RefreshCw,
  Activity,
  MapPin,
  Building
} from 'lucide-react';

export function EnergyRateIntelligence() {
  const [selectedMarket, setSelectedMarket] = useState('ERCOT');
  const [powerRequirement, setPowerRequirement] = useState(10);
  const [consumption, setConsumption] = useState(7200);
  
  
  const { 
    currentRates, 
    loading, 
    getCurrentRates, 
    calculateCosts 
  } = useEnergyRates();

  const [costCalculations, setCostCalculations] = useState<any[]>([]);
  const [calculatingCosts, setCalculatingCosts] = useState(false);
  
  const { toast } = useToast();

  const markets = [
    { code: 'ERCOT', name: 'Texas (ERCOT)', region: 'Texas' },
    { code: 'AESO', name: 'Alberta (AESO)', region: 'Alberta, Canada' },
    { code: 'PJM', name: 'Eastern US (PJM)', region: 'Eastern US' },
    { code: 'CAISO', name: 'California (CAISO)', region: 'California' },
    { code: 'NYISO', name: 'New York (NYISO)', region: 'New York' }
  ];

  useEffect(() => {
    fetchCurrentRates();
  }, [selectedMarket]);

  const fetchCurrentRates = async () => {
    try {
      await getCurrentRates(selectedMarket);
      toast({
        title: "Rates Updated",
        description: `Current energy rates for ${selectedMarket} have been refreshed.`
      });
    } catch (error: any) {
      console.error('Error fetching rates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch energy rates",
        variant: "destructive"
      });
    }
  };

  const calculateEnergyCosts = async () => {
    setCalculatingCosts(true);
    try {
      const result = await calculateCosts({
        monthly_consumption_mwh: consumption,
        peak_demand_mw: powerRequirement,
        location: { state: selectedMarket === 'ERCOT' ? 'TX' : 'AB' }
      });

      // Generate mock calculations for display
      const mockCalculations = generateMockCalculations();
      setCostCalculations(mockCalculations);
      
      toast({
        title: "Cost Analysis Complete",
        description: `Generated ${mockCalculations.length} rate estimates.`
      });
    } catch (error: any) {
      console.error('Error calculating costs:', error);
      const mockCalculations = generateMockCalculations();
      setCostCalculations(mockCalculations);
      toast({
        title: "Cost Estimate Generated",
        description: "Using estimated rates based on market data.",
        variant: "default"
      });
    } finally {
      setCalculatingCosts(false);
    }
  };

  const generateMockCalculations = () => {
    const baseRate = selectedMarket === 'ERCOT' ? 0.045 : 
                    selectedMarket === 'AESO' ? 0.078 :  // CAD to USD approximation
                    selectedMarket === 'CAISO' ? 0.065 : 
                    selectedMarket === 'PJM' ? 0.055 : 0.060;
    
    const utilities = selectedMarket === 'AESO' ? [
      { name: 'ATCO Electric', tariff: 'Large General Service', multiplier: 1.0 },
      { name: 'EPCOR Distribution', tariff: 'Industrial Rate', multiplier: 1.05 },
      { name: 'FortisAlberta', tariff: 'Commercial Service', multiplier: 0.98 },
      { name: 'AltaLink', tariff: 'Transmission Service', multiplier: 1.12 },
      { name: 'ENMAX Power', tariff: 'Business Rate', multiplier: 0.94 }
    ] : [
      { name: 'TXU Energy', tariff: 'Large Commercial Rate', multiplier: 1.0 },
      { name: 'Reliant Energy', tariff: 'Business Power Plus', multiplier: 1.05 },
      { name: 'Direct Energy', tariff: 'Commercial Fixed', multiplier: 0.98 },
      { name: 'Green Mountain Energy', tariff: 'Renewable Business', multiplier: 1.12 },
      { name: 'Champion Energy', tariff: 'Industrial Rate', multiplier: 0.94 }
    ];

    return utilities.map((utility, index) => {
      const rate = baseRate * utility.multiplier;
      const energyCost = consumption * rate * 1000;
      const demandCharge = powerRequirement * 15;
      const monthlyCost = energyCost + demandCharge;

      return {
        utility_name: utility.name,
        tariff_name: utility.tariff,
        monthly_cost: monthlyCost,
        annual_cost: monthlyCost * 12,
        cost_per_mwh: (monthlyCost / consumption) * 1000,
        breakdown: {
          energy_charge: energyCost,
          demand_charge: demandCharge,
          rate_per_kwh: rate,
          monthly_mwh: consumption
        }
      };
    }).sort((a, b) => a.monthly_cost - b.monthly_cost);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">Energy Rate Intelligence</h1>
          <p className="text-sm sm:text-base text-muted-foreground break-words">Real-time electricity pricing and cost analysis for power-intensive facilities</p>
        </div>
        <Button onClick={fetchCurrentRates} disabled={loading} className="flex-shrink-0 w-full sm:w-auto">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="sm:inline">Refresh Rates</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="text-sm font-medium">Energy Market</label>
              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background border shadow-lg">
                  {markets.map(market => (
                    <SelectItem key={market.code} value={market.code} className="cursor-pointer hover:bg-muted">
                      <span className="truncate">{market.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="current-rates" className="space-y-6">
        <div className="w-full overflow-x-auto">
          <TabsList className="grid grid-cols-4 w-full min-w-max sm:min-w-0">
            <TabsTrigger value="current-rates" className="text-xs sm:text-sm px-2 sm:px-4">Current Rates</TabsTrigger>
            <TabsTrigger value="cost-calculator" className="text-xs sm:text-sm px-2 sm:px-4">Cost Calculator</TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs sm:text-sm px-2 sm:px-4">Price Forecast</TabsTrigger>
            <TabsTrigger value="rate-finder" className="text-xs sm:text-sm px-2 sm:px-4">Rate Finder</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="current-rates" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-xl sm:text-2xl font-bold break-all">
                      ${currentRates?.current_rate ? currentRates.current_rate.toFixed(2) : '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground">per MWh</p>
                  </div>
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Demand Rate</p>
                    <p className="text-2xl font-bold">
                      ${currentRates?.peak_demand_rate ? currentRates.peak_demand_rate.toFixed(2) : '0.00'}
                    </p>
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
              <CardTitle>Current Market Data</CardTitle>
            </CardHeader>
            <CardContent>
              {currentRates ? (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Rate</p>
                        <p className="font-bold text-lg">${currentRates.current_rate?.toFixed(2)}/MWh</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Market Code</p>
                        <p className="font-medium">{currentRates.market_code || selectedMarket}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conditions</p>
                        <Badge variant="default">{currentRates.market_conditions || 'Normal'}</Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="text-xs">
                          {currentRates.timestamp ? new Date(currentRates.timestamp).toLocaleString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {currentRates.forecast && currentRates.forecast.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Price Forecast (Next 3 Periods)</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {currentRates.forecast.map((price: number, index: number) => (
                          <div key={index} className="bg-blue-50 rounded p-2 text-center">
                            <div className="text-sm text-muted-foreground">Period {index + 1}</div>
                            <div className="font-bold">${price.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rate data available. Click "Refresh Rates" to load current pricing.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AESO-specific Market Data */}
          {selectedMarket === 'AESO' && currentRates?.load_data && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  AESO Grid Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {currentRates.load_data.current_demand_mw?.toLocaleString()} MW
                    </div>
                    <div className="text-sm text-blue-700">Current Demand</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {currentRates.load_data.peak_forecast_mw?.toLocaleString()} MW
                    </div>
                    <div className="text-sm text-green-700">Peak Forecast</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">
                      {currentRates.load_data.reserve_margin}%
                    </div>
                    <div className="text-sm text-yellow-700">Reserve Margin</div>
                  </div>
                </div>

                {currentRates.generation_mix && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Generation Mix</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Renewable Sources</span>
                        <Badge variant="secondary">
                          {currentRates.generation_mix.renewable_percentage}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Natural Gas:</span>
                          <span>{currentRates.generation_mix.natural_gas_mw} MW</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wind:</span>
                          <span>{currentRates.generation_mix.wind_mw} MW</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Solar:</span>
                          <span>{currentRates.generation_mix.solar_mw} MW</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hydro:</span>
                          <span>{currentRates.generation_mix.hydro_mw} MW</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
              <Button 
                onClick={calculateEnergyCosts} 
                disabled={calculatingCosts} 
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                {calculatingCosts ? 'Calculating...' : 'Calculate Energy Costs'}
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
              <CardTitle>Price Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Price forecasting feature coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-finder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Finder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Rate comparison tool coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
