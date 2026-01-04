
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { VoltMarketListingCard } from './VoltMarketListingCard';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, MapPin, Zap } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  listing_type: string;
  asking_price: number;
  lease_rate: number;
  power_rate_per_kw: number;
  power_capacity_mw: number;
  created_at: string;
  status: string;
  seller_id: string;
  voltmarket_profiles: {
    company_name: string;
    is_id_verified: boolean;
  } | null;
}

export const VoltMarketListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const fetchListings = async () => {
    console.log('Fetching listings...');
    try {
      const { data, error } = await supabase
        .from('voltmarket_listings')
        .select(`
          *,
          voltmarket_profiles!seller_id(company_name, is_id_verified)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('Listings query result:', { data, error });

      if (error) throw error;
      
      // Transform the data to match the expected interface
      const transformedData = data?.map(listing => ({
        ...listing,
        voltmarket_profiles: listing.voltmarket_profiles
      })) || [];
      
      console.log('Transformed listings:', transformedData);
      setListings(transformedData);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = searchQuery === '' || 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || listing.listing_type === selectedType;
    
    const matchesLocation = selectedLocation === 'all' || 
      listing.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesType && matchesLocation;
  });

  const uniqueLocations = Array.from(new Set(listings.map(l => l.location.split(',').pop()?.trim()))).filter(Boolean);

  useEffect(() => {
    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Browse Listings</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Find sites, hosting facilities, and equipment</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="site_sale">Sites for Sale</SelectItem>
                    <SelectItem value="site_lease">Sites for Lease</SelectItem>
                    <SelectItem value="hosting">Hosting</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map(location => (
                      <SelectItem key={location} value={location!}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedLocation('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {filteredListings.length} listings found
            </span>
            {(searchQuery || selectedType !== 'all' || selectedLocation !== 'all') && (
              <div className="flex gap-2 flex-wrap">
                {searchQuery && (
                  <Badge variant="secondary">
                    Search: {searchQuery}
                  </Badge>
                )}
                {selectedType !== 'all' && (
                  <Badge variant="secondary">
                    Type: {selectedType.replace('_', ' ')}
                  </Badge>
                )}
                {selectedLocation !== 'all' && (
                  <Badge variant="secondary">
                    Location: {selectedLocation}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or check back later for new listings.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedLocation('all');
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <VoltMarketListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
