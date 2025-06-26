
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
    <div className="w-full px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
      <EnvironmentalHeader />
      <div className="w-full">
        <EnvironmentalSearch 
          region={region}
          setRegion={setRegion}
          loading={loading}
          onSearch={handleRegionSearch}
        />
      </div>
      <div className="w-full">
        <EPAAirQualityCard epaData={epaData} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <NRELSolarCard solarData={solarData} />
        <NOAAWeatherCard weatherData={weatherData} />
      </div>
    </div>
  );
}
