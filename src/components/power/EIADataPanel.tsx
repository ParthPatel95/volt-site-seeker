
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEIAData } from '@/hooks/useEIAData';
import { 
  Database,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { EIADataControls } from './EIADataControls';
import { EIAPowerPlantsTab } from './EIAPowerPlantsTab';
import { EIAEnergyPricesTab } from './EIAEnergyPricesTab';
import { EIATransmissionTab } from './EIATransmissionTab';
import { EIAGenerationTab } from './EIAGenerationTab';

export function EIADataPanel() {
  const [selectedState, setSelectedState] = useState('TX');
  const [selectedFuelType, setSelectedFuelType] = useState('all');
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
      const fuelType = selectedFuelType === 'all' ? undefined : selectedFuelType;
      const result = await getPowerPlantsByState(selectedState, fuelType);
      setDataStatus(result?.data_source === 'Cached' ? 'cached' : 'success');
    } catch (error) {
      setDataStatus('cached');
    }
  };

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

      <EIADataControls
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedFuelType={selectedFuelType}
        setSelectedFuelType={setSelectedFuelType}
        loading={loading}
        onRefresh={handleFetchPowerPlants}
      />

      <Tabs defaultValue="power-plants" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="power-plants">Power Plants</TabsTrigger>
          <TabsTrigger value="energy-prices">Energy Prices</TabsTrigger>
          <TabsTrigger value="transmission">Transmission</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="power-plants">
          <EIAPowerPlantsTab 
            powerPlants={powerPlants}
            loading={loading}
            onRefresh={handleFetchPowerPlants}
          />
        </TabsContent>

        <TabsContent value="energy-prices">
          <EIAEnergyPricesTab 
            energyPrices={energyPrices}
            loading={loading}
            onRefresh={() => getEnergyPricesByRegion(selectedState)}
          />
        </TabsContent>

        <TabsContent value="transmission">
          <EIATransmissionTab 
            transmissionData={transmissionData}
            loading={loading}
            onRefresh={() => getTransmissionDataByState(selectedState)}
          />
        </TabsContent>

        <TabsContent value="generation">
          <EIAGenerationTab 
            generationData={generationData}
            loading={loading}
            onRefresh={() => {
              const fuelType = selectedFuelType === 'all' ? undefined : selectedFuelType;
              getGenerationDataByState(selectedState, fuelType);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
