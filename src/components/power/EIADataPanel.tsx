import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEIAData } from '@/hooks/useEIAData';
import { 
  Zap, 
  Building, 
  DollarSign, 
  TrendingUp,
  MapPin,
  Fuel,
  RefreshCw,
  Database,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function EIADataPanel() {
  const [selectedState, setSelectedState] = useState('TX');
  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [dataStatus, setDataStatus] = useState<'loading' | 'success' | 'cached'>('cached');
  
  const {
    loading,
    powerPlants,
    energyPrices,
    transmissionData,
    generationData,
    getPowerPlantsByState,
    getEnergyPricesByRegion,
    getTransmissionDataByState,
    getGenerationDataByState
  } = useEIAData();

  // Load initial data
  useEffect(() => {
    handleFetchPowerPlants();
  }, []);

  const handleFetchPowerPlants = async () => {
    setDataStatus('loading');
    try {
      const result = await getPowerPlantsByState(selectedState, selectedFuelType || undefined);
      setDataStatus(result?.data_source === 'Cached' ? 'cached' : 'success');
    } catch (error) {
      setDataStatus('cached');
    }
  };

  const handleFetchEnergyPrices = async () => {
    setDataStatus('loading');
    try {
      await getEnergyPricesByRegion(selectedState);
      setDataStatus('success');
    } catch (error) {
      setDataStatus('cached');
    }
  };

  const handleFetchTransmissionData = async () => {
    setDataStatus('loading');
    try {
      await getTransmissionDataByState(selectedState);
      setDataStatus('success');
    } catch (error) {
      setDataStatus('cached');
    }
  };

  const handleFetchGenerationData = async () => {
    setDataStatus('loading');
    try {
      await getGenerationDataByState(selectedState, selectedFuelType || undefined);
      setDataStatus('success');
    } catch (error) {
      setDataStatus('cached');
    }
  };

  const states = [
    'TX', 'CA', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
    'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI'
  ];

  const fuelTypes = [
    { value: '', label: 'All Fuel Types' },
    { value: 'NG', label: 'Natural Gas' },
    { value: 'COL', label: 'Coal' },
    { value: 'NUC', label: 'Nuclear' },
    { value: 'SUN', label: 'Solar' },
    { value: 'WND', label: 'Wind' },
    { value: 'WAT', label: 'Hydro' },
    { value: 'OIL', label: 'Oil' }
  ];

  const getStatusIcon = () => {
    switch (dataStatus) {
      case 'loading':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cached':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (dataStatus) {
      case 'loading':
        return 'Loading...';
      case 'success':
        return 'Live Data';
      case 'cached':
        return 'Cached Data';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Database className="w-6 h-6 mr-2 text-blue-600" />
            EIA Official Data Integration
          </h2>
          <p className="text-muted-foreground">
            U.S. Energy Information Administration data and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <Badge variant={dataStatus === 'success' ? 'default' : 'secondary'}>
            {getStatusText()}
          </Badge>
        </div>
      </div>

      {/* Status Notice */}
      {dataStatus === 'cached' && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                Displaying cached data while EIA API is being updated. Data may be from recent queries.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Data Query Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Fuel Type (Optional)</label>
              <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map(fuel => (
                    <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleFetchPowerPlants} 
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="power-plants" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="power-plants">Power Plants</TabsTrigger>
          <TabsTrigger value="energy-prices">Energy Prices</TabsTrigger>
          <TabsTrigger value="transmission">Transmission</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="power-plants" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Power Plants Data</h3>
            <Button variant="outline" onClick={handleFetchPowerPlants} disabled={loading}>
              <Zap className="w-4 h-4 mr-2" />
              Refresh Plants
            </Button>
          </div>
          
          {powerPlants.length > 0 ? (
            <div className="grid gap-4">
              {powerPlants.slice(0, 10).map((plant) => (
                <Card key={plant.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{plant.name}</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {plant.state} • {plant.utility_name}
                        </div>
                        <div className="flex items-center text-sm">
                          <Fuel className="w-3 h-3 mr-1" />
                          {plant.fuel_type}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{plant.capacity_mw.toFixed(0)} MW</div>
                        <Badge variant={plant.operational_status === 'OP' ? 'default' : 'secondary'}>
                          {plant.operational_status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {powerPlants.length > 10 && (
                <p className="text-center text-muted-foreground">
                  Showing 10 of {powerPlants.length} power plants
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Click "Refresh Plants" to load EIA power plant data.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="energy-prices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Energy Pricing Data</h3>
            <Button variant="outline" onClick={handleFetchEnergyPrices} disabled={loading}>
              <DollarSign className="w-4 h-4 mr-2" />
              Refresh Prices
            </Button>
          </div>
          
          {energyPrices.length > 0 ? (
            <div className="grid gap-4">
              {energyPrices.slice(0, 6).map((price, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Period: {price.period}</h4>
                        <p className="text-sm text-muted-foreground">{price.state} • {price.sector}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{price.price_cents_per_kwh.toFixed(2)}¢/kWh</div>
                        <p className="text-sm text-muted-foreground">
                          ${price.revenue_thousand_dollars.toLocaleString()}k revenue
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Click "Refresh Prices" to load EIA pricing data.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transmission" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Transmission Infrastructure</h3>
            <Button variant="outline" onClick={handleFetchTransmissionData} disabled={loading}>
              <Zap className="w-4 h-4 mr-2" />
              Refresh Transmission
            </Button>
          </div>
          
          {transmissionData ? (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Lines Analyzed</p>
                    <p className="text-2xl font-bold">{transmissionData.analysis?.total_lines_analyzed || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Efficiency Rating</p>
                    <p className="text-2xl font-bold">{transmissionData.analysis?.efficiency_rating || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grid Reliability</p>
                    <p className="text-2xl font-bold">{transmissionData.analysis?.grid_reliability || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Source</p>
                    <Badge variant="outline">EIA Official</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Click "Refresh Transmission" to load EIA transmission data.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="generation" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Power Generation Data</h3>
            <Button variant="outline" onClick={handleFetchGenerationData} disabled={loading}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh Generation
            </Button>
          </div>
          
          {generationData.length > 0 ? (
            <div className="grid gap-4">
              {generationData.slice(0, 8).map((gen, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{gen.period}</h4>
                        <p className="text-sm text-muted-foreground">{gen.location} • {gen.fuel_type}</p>
                        <p className="text-xs text-muted-foreground">{gen.type_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{gen.generation_mwh.toLocaleString()} MWh</div>
                        <Badge variant="outline">{gen.fuel_type}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Click "Refresh Generation" to load EIA generation data.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
