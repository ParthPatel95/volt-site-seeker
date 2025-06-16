
import { useState } from 'react';
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
  Database
} from 'lucide-react';

export function EIADataPanel() {
  const [selectedState, setSelectedState] = useState('TX');
  const [selectedFuelType, setSelectedFuelType] = useState('');
  
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

  const handleFetchPowerPlants = async () => {
    await getPowerPlantsByState(selectedState, selectedFuelType || undefined);
  };

  const handleFetchEnergyPrices = async () => {
    await getEnergyPricesByRegion(selectedState);
  };

  const handleFetchTransmissionData = async () => {
    await getTransmissionDataByState(selectedState);
  };

  const handleFetchGenerationData = async () => {
    await getGenerationDataByState(selectedState, selectedFuelType || undefined);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Database className="w-6 h-6 mr-2 text-blue-600" />
            EIA Official Data Integration
          </h2>
          <p className="text-muted-foreground">
            Real-time power infrastructure data from the U.S. Energy Information Administration
          </p>
        </div>
        <Badge variant="default" className="px-3 py-1">
          Official Government Data
        </Badge>
      </div>

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
                Fetch EIA Data
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
              <p>No power plants data loaded. Click "Refresh Plants" to fetch EIA data.</p>
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
              <p>No pricing data loaded. Click "Refresh Prices" to fetch EIA data.</p>
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
              <p>No transmission data loaded. Click "Refresh Transmission" to fetch EIA data.</p>
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
              <p>No generation data loaded. Click "Refresh Generation" to fetch EIA data.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
