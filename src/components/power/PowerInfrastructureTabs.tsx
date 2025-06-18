
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PowerInfrastructureTabs() {
  return (
    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-10">
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="capacity-estimator">Capacity AI</TabsTrigger>
      <TabsTrigger value="google-finder">Google Finder</TabsTrigger>
      <TabsTrigger value="map-finder">Map Finder</TabsTrigger>
      <TabsTrigger value="ercot-live">ERCOT Live</TabsTrigger>
      <TabsTrigger value="ferc-data">FERC Data</TabsTrigger>
      <TabsTrigger value="usgs-data">USGS Data</TabsTrigger>
      <TabsTrigger value="environmental">Environmental</TabsTrigger>
      <TabsTrigger value="mapbox-explorer">Mapbox Explorer</TabsTrigger>
      <TabsTrigger value="eia-data">EIA Data</TabsTrigger>
    </TabsList>
  );
}
