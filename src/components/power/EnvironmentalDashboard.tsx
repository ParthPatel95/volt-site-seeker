
import React, { useEffect, useState } from 'react';
import { useEnergyData } from '@/hooks/useEnergyData';
import { EnvironmentalHeader } from './EnvironmentalHeader';
import { EnvironmentalSearch } from './EnvironmentalSearch';
import { EPAAirQualityCard } from './EPAAirQualityCard';
import { NRELSolarCard } from './NRELSolarCard';
import { NOAAWeatherCard } from './NOAAWeatherCard';

export function EnvironmentalDashboard() {
  const { 
    epaData, 
    solarData, 
    weatherData, 
    loading,
    getEPAEmissions,
    getNRELSolarData,
    getNOAAWeatherData
  } = useEnergyData();

  const [region, setRegion] = useState('Texas');

  useEffect(() => {
    // Load default data for Texas
    getEPAEmissions('Texas');
    getNRELSolarData('Texas');
    getNOAAWeatherData('Texas');
  }, []);

  const handleRegionSearch = async () => {
    if (!region.trim()) return;
    
    try {
      await Promise.all([
        getEPAEmissions(region),
        getNRELSolarData(region),
        getNOAAWeatherData(region)
      ]);
    } catch (error) {
      console.error('Error fetching environmental data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <EnvironmentalHeader />
      <EnvironmentalSearch 
        region={region}
        setRegion={setRegion}
        loading={loading}
        onSearch={handleRegionSearch}
      />
      <EPAAirQualityCard epaData={epaData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NRELSolarCard solarData={solarData} />
        <NOAAWeatherCard weatherData={weatherData} />
      </div>
    </div>
  );
}
