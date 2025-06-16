
import React, { useState } from 'react';
import { useUSGSData } from '@/hooks/useUSGSData';
import { USGSDashboardHeader } from './USGSDashboardHeader';
import { USGSLocationSearch } from './USGSLocationSearch';
import { USGSElevationCard } from './USGSElevationCard';
import { USGSLandUseCard } from './USGSLandUseCard';
import { USGSGeologicalCard } from './USGSGeologicalCard';

export function USGSDashboard() {
  const { 
    elevationData, 
    landUseData, 
    geologicalData, 
    loading,
    getElevationData,
    getLandUseData,
    getGeologicalData,
    getWaterData
  } = useUSGSData();

  const [coordinates, setCoordinates] = useState({
    latitude: 32.7767,
    longitude: -96.7970
  });

  const [searchResults, setSearchResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!coordinates.latitude || !coordinates.longitude) return;
    
    try {
      const [elevation, landUse, geological, water] = await Promise.all([
        getElevationData(coordinates),
        getLandUseData(coordinates),
        getGeologicalData(coordinates),
        getWaterData(coordinates)
      ]);

      setSearchResults({ elevation, landUse, geological, water });
    } catch (error) {
      console.error('Error fetching USGS data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <USGSDashboardHeader />
      <USGSLocationSearch 
        coordinates={coordinates}
        setCoordinates={setCoordinates}
        loading={loading}
        onSearch={handleSearch}
      />
      <USGSElevationCard 
        elevationData={elevationData}
        searchResults={searchResults}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <USGSLandUseCard 
          landUseData={landUseData}
          searchResults={searchResults}
        />
        <USGSGeologicalCard 
          geologicalData={geologicalData}
          searchResults={searchResults}
        />
      </div>
    </div>
  );
}
