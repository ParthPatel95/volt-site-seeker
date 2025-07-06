import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EnhancedMapboxMap } from '@/components/EnhancedMapboxMap';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter,
  Layers,
  Zap,
  Building2,
  DollarSign,
  Maximize,
  Minimize,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PropertyLocation {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  coordinates: [number, number];
  asking_price: number;
  property_type: string;
  power_capacity_mw?: number;
  size_sqft?: number;
  status: string;
  image_url?: string;
}

interface NearbyInfrastructure {
  substations: Array<{
    name: string;
    latitude: number;
    longitude: number;
    capacity_mva: number;
    voltage_level: string;
    distance_miles: number;
  }>;
  power_plants: Array<{
    name: string;
    coordinates: { lat: number; lng: number };
    capacity_mw: number;
    fuel_type: string;
    distance_miles: number;
  }>;
  transmission_lines: Array<{
    name: string;
    voltage: number;
    distance_miles: number;
  }>;
}

interface VoltMarketPropertyMapProps {
  listingId?: string;
  listings?: any[];
  initialCenter?: [number, number];
  height?: string;
  showSearch?: boolean;
  showFilters?: boolean;
}

export const VoltMarketPropertyMap: React.FC<VoltMarketPropertyMapProps> = ({
  listingId,
  listings = [],
  initialCenter,
  height = 'h-96',
  showSearch = true,
  showFilters = true
}) => {
  const [properties, setProperties] = useState<PropertyLocation[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyLocation | null>(null);
  const [nearbyInfrastructure, setNearbyInfrastructure] = useState<NearbyInfrastructure>({
    substations: [],
    power_plants: [],
    transmission_lines: []
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [showInfrastructure, setShowInfrastructure] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProperties();
  }, [listingId, listings]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      let propertyData: PropertyLocation[] = [];

      if (listingId) {
        // Load single listing location
        const { data, error } = await supabase
          .from('voltmarket_listings')
          .select('*')
          .eq('id', listingId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching listing:', error);
          throw error;
        }

        console.log('Listing data:', data); // Debug log

        if (data) {
          // Check if coordinates exist
          if (data.latitude && data.longitude) {
            propertyData = [{
              id: data.id,
              title: data.title,
              address: data.location || 'Location not specified',
              city: data.location?.split(',')[0]?.trim() || 'Unknown City',
              state: data.location?.split(',')[1]?.trim() || 'Unknown State',
              coordinates: [data.longitude, data.latitude],
              asking_price: data.asking_price,
              property_type: data.listing_type,
              power_capacity_mw: data.power_capacity_mw,
              size_sqft: data.square_footage,
              status: data.status,
              image_url: undefined // Images are handled separately in VoltMarket
            }];
            console.log('Property data with coordinates:', propertyData); // Debug log
          } else {
            console.warn('Listing found but no coordinates available:', { 
              lat: data.latitude, 
              lng: data.longitude,
              location: data.location 
            });
            toast({
              title: "Location Unavailable",
              description: "This listing doesn't have location coordinates available for mapping.",
              variant: "destructive"
            });
          }
        } else {
          console.warn('No listing found with ID:', listingId);
          toast({
            title: "Listing Not Found",
            description: "Could not find the requested listing.",
            variant: "destructive"
          });
        }
      } else if (listings.length > 0) {
        // Use provided listings
        propertyData = listings
          .filter(listing => {
            const hasCoords = listing.latitude && listing.longitude;
            if (!hasCoords) {
              console.log('Skipping listing without coordinates:', listing.id);
            }
            return hasCoords;
          })
          .map(listing => ({
            id: listing.id,
            title: listing.title,
            address: listing.location || 'Location not specified',
            city: listing.location?.split(',')[0]?.trim() || 'Unknown City',
            state: listing.location?.split(',')[1]?.trim() || 'Unknown State',
            coordinates: [listing.longitude, listing.latitude],
            asking_price: listing.asking_price,
            property_type: listing.listing_type,
            power_capacity_mw: listing.power_capacity_mw,
            size_sqft: listing.square_footage,
            status: listing.status,
            image_url: undefined // Images are handled separately in VoltMarket
          }));
      } else {
        // Load all active listings with coordinates
        const { data, error } = await supabase
          .from('voltmarket_listings')
          .select('*')
          .eq('status', 'active')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) throw error;

        propertyData = (data || []).map(listing => ({
          id: listing.id,
          title: listing.title,
          address: listing.location || 'Location not specified',
          city: listing.location?.split(',')[0]?.trim() || 'Unknown City',
          state: listing.location?.split(',')[1]?.trim() || 'Unknown State',
          coordinates: [listing.longitude, listing.latitude],
          asking_price: listing.asking_price,
          property_type: listing.listing_type,
          power_capacity_mw: listing.power_capacity_mw,
          size_sqft: listing.square_footage,
          status: listing.status,
          image_url: undefined // Images are handled separately in VoltMarket
        }));
      }

      console.log('Final property data:', propertyData); // Debug log
      setProperties(propertyData);
      
      // Load nearby infrastructure for the first property or selected property
      if (propertyData.length > 0) {
        const targetProperty = propertyData[0];
        await loadNearbyInfrastructure(targetProperty.coordinates);
      } else {
        console.log('No properties with coordinates found');
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        title: "Error",
        description: `Failed to load property locations: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyInfrastructure = async (coordinates: [number, number]) => {
    try {
      // Mock nearby infrastructure data - in production, this would come from actual APIs
      const mockSubstations = [
        {
          name: "Central Distribution Station",
          latitude: coordinates[1] + 0.01,
          longitude: coordinates[0] + 0.01,
          capacity_mva: 150,
          voltage_level: "138kV",
          distance_miles: 0.8
        },
        {
          name: "North Grid Substation",
          latitude: coordinates[1] - 0.02,
          longitude: coordinates[0] + 0.015,
          capacity_mva: 200,
          voltage_level: "230kV",
          distance_miles: 1.2
        }
      ];

      const mockPowerPlants = [
        {
          name: "Regional Power Station",
          coordinates: { lat: coordinates[1] + 0.05, lng: coordinates[0] - 0.03 },
          capacity_mw: 500,
          fuel_type: "Natural Gas",
          distance_miles: 3.5
        }
      ];

      setNearbyInfrastructure({
        substations: mockSubstations,
        power_plants: mockPowerPlants,
        transmission_lines: [
          { name: "Main Transmission Line", voltage: 345000, distance_miles: 0.5 },
          { name: "Distribution Feeder", voltage: 138000, distance_miles: 0.2 }
        ]
      });
    } catch (error) {
      console.error('Error loading infrastructure:', error);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchQuery || 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = property.asking_price >= priceRange[0] && property.asking_price <= priceRange[1];
    
    const matchesType = propertyTypeFilter === 'all' || property.property_type === propertyTypeFilter;
    
    return matchesSearch && matchesPrice && matchesType;
  });

  // Convert properties to format expected by map
  const mapPowerPlants = showInfrastructure ? nearbyInfrastructure.power_plants : [];
  const mapSubstations = showInfrastructure ? nearbyInfrastructure.substations : [];

  // Calculate center point
  const mapCenter: [number, number] = initialCenter || 
    (filteredProperties.length > 0 
      ? filteredProperties[0].coordinates 
      : [-98.5795, 39.8283]);

  const handlePropertySelect = (property: PropertyLocation) => {
    setSelectedProperty(property);
    loadNearbyInfrastructure(property.coordinates);
  };

  const PropertyCard = ({ property }: { property: PropertyLocation }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedProperty?.id === property.id ? 'ring-2 ring-watt-primary' : ''
      }`}
      onClick={() => handlePropertySelect(property)}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm line-clamp-2">{property.title}</h4>
            <Badge variant="outline" className="text-xs">
              {property.property_type}
            </Badge>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1" />
            {property.city}, {property.state}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-watt-success">
              <DollarSign className="w-3 h-3 mr-1" />
              ${(property.asking_price / 1000000).toFixed(1)}M
            </div>
            {property.power_capacity_mw && (
              <div className="flex items-center text-watt-primary">
                <Zap className="w-3 h-3 mr-1" />
                {property.power_capacity_mw} MW
              </div>
            )}
          </div>
          
          {property.size_sqft && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Building2 className="w-3 h-3 mr-1" />
              {property.size_sqft.toLocaleString()} sq ft
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'relative'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Property Locations
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInfrastructure(!showInfrastructure)}
            >
              <Layers className="w-4 h-4 mr-2" />
              {showInfrastructure ? 'Hide' : 'Show'} Infrastructure
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Map */}
          <div className="flex-1 relative">
            <EnhancedMapboxMap
              height="h-full"
              initialCenter={mapCenter}
              initialZoom={listingId ? 12 : 6}
              powerPlants={mapPowerPlants}
              substations={mapSubstations}
            />
            
            {/* Property Markers Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Custom property markers would be added here via map instance */}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-background overflow-y-auto">
            {/* Search & Filters */}
            {showSearch && (
              <div className="p-4 border-b space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {showFilters && (
                  <div className="space-y-2">
                    <select
                      value={propertyTypeFilter}
                      onChange={(e) => setPropertyTypeFilter(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value="all">All Property Types</option>
                      <option value="industrial">Industrial</option>
                      <option value="data_center">Data Center</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="renewable">Renewable Energy</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Selected Property Info */}
            {selectedProperty && (
              <div className="p-4 border-b bg-muted/50">
                <h4 className="font-medium mb-2">Selected Property</h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{selectedProperty.title}</p>
                  <p className="text-muted-foreground">{selectedProperty.address}</p>
                  <p className="text-watt-success font-medium">
                    ${(selectedProperty.asking_price / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            )}

            {/* Nearby Infrastructure */}
            {showInfrastructure && nearbyInfrastructure.substations.length > 0 && (
              <div className="p-4 border-b">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Nearby Infrastructure
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-watt-primary">Substations</p>
                    {nearbyInfrastructure.substations.map((sub, index) => (
                      <div key={index} className="text-xs text-muted-foreground ml-2">
                        {sub.name} - {sub.capacity_mva} MVA ({sub.distance_miles} mi)
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-medium text-watt-warning">Power Plants</p>
                    {nearbyInfrastructure.power_plants.map((plant, index) => (
                      <div key={index} className="text-xs text-muted-foreground ml-2">
                        {plant.name} - {plant.capacity_mw} MW ({plant.distance_miles} mi)
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Properties List */}
            <div className="p-4">
              <h4 className="font-medium mb-3">
                Properties ({filteredProperties.length})
              </h4>
              
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-watt-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading properties...</p>
                </div>
              )}
              
              <div className="space-y-3">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              
              {filteredProperties.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <div className="space-y-2">
                    <p>No properties found with location data.</p>
                    {listingId && (
                      <p className="text-xs">This listing may not have coordinates set up yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};