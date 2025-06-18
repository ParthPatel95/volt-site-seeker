
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedMapboxMap } from '../EnhancedMapboxMap';
import { 
  MapPin, 
  Building, 
  Server, 
  Factory,
  Filter,
  Search,
  Download,
  Eye,
  FileText
} from 'lucide-react';

interface RealEstateAsset {
  id: string;
  company_ticker?: string;
  company_name: string;
  property_type: 'Office' | 'Data Center' | 'Industrial' | 'Other Industrial Asset';
  location_description: string;
  coordinates?: [number, number] | null;
  source: string;
  raw_text?: string;
  created_at: string;
}

interface CompanyRealEstateMapProps {
  company?: any;
}

export function CompanyRealEstateMap({ company }: CompanyRealEstateMapProps) {
  const [realEstateAssets, setRealEstateAssets] = useState<RealEstateAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<RealEstateAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<RealEstateAsset | null>(null);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-98.5795, 39.8283]);
  const [mapZoom, setMapZoom] = useState(4);

  useEffect(() => {
    if (company?.real_estate_assets) {
      const assets = company.real_estate_assets.map((asset: any) => ({
        ...asset,
        company_name: company.name
      }));
      setRealEstateAssets(assets);
      setFilteredAssets(assets);
      
      // Center map on assets if available
      if (assets.length > 0) {
        const validCoords = assets.filter((asset: any) => asset.coordinates);
        if (validCoords.length > 0) {
          const avgLat = validCoords.reduce((sum: number, asset: any) => sum + asset.coordinates[1], 0) / validCoords.length;
          const avgLng = validCoords.reduce((sum: number, asset: any) => sum + asset.coordinates[0], 0) / validCoords.length;
          setMapCenter([avgLng, avgLat]);
          setMapZoom(6);
        }
      }
    }
  }, [company]);

  useEffect(() => {
    let filtered = realEstateAssets;
    
    if (propertyTypeFilter !== 'all') {
      filtered = filtered.filter(asset => asset.property_type === propertyTypeFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.location_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.property_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAssets(filtered);
  }, [realEstateAssets, propertyTypeFilter, searchTerm]);

  const getPropertyIcon = (propertyType: string) => {
    switch (propertyType) {
      case 'Office':
        return Building;
      case 'Data Center':
        return Server;
      case 'Industrial':
      case 'Other Industrial Asset':
        return Factory;
      default:
        return MapPin;
    }
  };

  const getPropertyColor = (propertyType: string) => {
    switch (propertyType) {
      case 'Office':
        return '#3b82f6'; // Blue
      case 'Data Center':
        return '#10b981'; // Green
      case 'Industrial':
      case 'Other Industrial Asset':
        return '#f59e0b'; // Orange
      default:
        return '#6b7280'; // Gray
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Company', 'Property Type', 'Location', 'Coordinates', 'Source'],
      ...filteredAssets.map(asset => [
        asset.company_name,
        asset.property_type,
        asset.location_description,
        asset.coordinates ? `${asset.coordinates[1]}, ${asset.coordinates[0]}` : 'Not Available',
        asset.source
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company?.name || 'company'}_real_estate_assets.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Convert assets to map markers format
  const mapMarkers = filteredAssets
    .filter(asset => asset.coordinates)
    .map(asset => ({
      name: `${asset.property_type} - ${asset.location_description}`,
      coordinates: { lat: asset.coordinates![1], lng: asset.coordinates![0] },
      capacity_mw: 0, // Not applicable for real estate
      fuel_type: asset.property_type,
      id: asset.id,
      color: getPropertyColor(asset.property_type)
    }));

  if (!company?.real_estate_assets || company.real_estate_assets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Real Estate Data Available</h3>
          <p className="text-sm text-muted-foreground">
            {company?.ticker 
              ? "SEC filings analysis didn't find specific real estate asset locations for this company."
              : "Please provide a ticker symbol to analyze SEC filings for real estate assets."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Real Estate Assets from SEC Filings</span>
              <Badge variant="outline">{company.name}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Property Types</SelectItem>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Data Center">Data Center</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Other Industrial Asset">Other Industrial Asset</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredAssets.length} of {realEstateAssets.length} assets
              </span>
            </div>
          </div>

          {/* Asset Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Office', 'Data Center', 'Industrial', 'Other Industrial Asset'].map((type) => {
              const count = realEstateAssets.filter(asset => asset.property_type === type).length;
              const Icon = getPropertyIcon(type);
              return (
                <div key={type} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-1" style={{ color: getPropertyColor(type) }} />
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{type}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <EnhancedMapboxMap
            height="h-[500px]"
            initialCenter={mapCenter}
            initialZoom={mapZoom}
            showControls={true}
            powerPlants={mapMarkers}
            substations={[]}
          />
        </CardContent>
      </Card>

      {/* Asset Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssets.map((asset) => {
          const Icon = getPropertyIcon(asset.property_type);
          return (
            <Card key={asset.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: getPropertyColor(asset.property_type) }} 
                    />
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: getPropertyColor(asset.property_type),
                        color: getPropertyColor(asset.property_type)
                      }}
                    >
                      {asset.property_type}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {asset.source}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{asset.location_description}</p>
                  </div>
                  
                  {asset.coordinates && (
                    <div>
                      <p className="text-sm font-medium">Coordinates</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {asset.coordinates[1].toFixed(4)}, {asset.coordinates[0].toFixed(4)}
                      </p>
                    </div>
                  )}
                  
                  {asset.raw_text && (
                    <div>
                      <p className="text-sm font-medium">Filing Context</p>
                      <p className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {asset.raw_text}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">SEC Filing</span>
                  </div>
                  {asset.coordinates && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMapCenter(asset.coordinates!);
                        setMapZoom(10);
                        setSelectedAsset(asset);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View on Map
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
