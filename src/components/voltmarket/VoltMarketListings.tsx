
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { VoltMarketListingCard } from './VoltMarketListingCard';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, MapPin, Zap, Building2, Server } from 'lucide-react';

type ListingType = 'site_sale' | 'site_lease' | 'hosting' | 'equipment';

interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  listing_type: ListingType;
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
  };
}

export const VoltMarketListings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || 'all',
    location: '',
    minPrice: '',
    maxPrice: '',
    minPower: '',
    maxPower: ''
  });

  const fetchListings = async () => {
    setLoading(true);
    
    let query = supabase
      .from('voltmarket_listings')
      .select(`
        *,
        voltmarket_profiles (
          company_name,
          is_id_verified
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.type !== 'all') {
      query = query.eq('listing_type', filters.type as ListingType);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      query = query.or(`asking_price.gte.${minPrice},lease_rate.gte.${minPrice},power_rate_per_kw.gte.${minPrice}`);
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      query = query.or(`asking_price.lte.${maxPrice},lease_rate.lte.${maxPrice},power_rate_per_kw.lte.${maxPrice}`);
    }

    if (filters.minPower) {
      query = query.gte('power_capacity_mw', parseFloat(filters.minPower));
    }

    if (filters.maxPower) {
      query = query.lte('power_capacity_mw', parseFloat(filters.maxPower));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value && key !== 'search') {
      newParams.set(key, value);
    } else if (!value) {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      location: '',
      minPrice: '',
      maxPrice: '',
      minPower: '',
      maxPower: ''
    });
    setSearchParams({});
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'site_sale':
      case 'site_lease':
        return <Building2 className="w-4 h-4" />;
      case 'hosting':
        return <Server className="w-4 h-4" />;
      case 'equipment':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatListingType = (type: string) => {
    switch (type) {
      case 'site_sale':
        return 'Site for Sale';
      case 'site_lease':
        return 'Site for Lease';
      case 'hosting':
        return 'Hosting';
      case 'equipment':
        return 'Equipment';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Listings</h1>
          <p className="text-gray-600">Discover power infrastructure opportunities worldwide</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search listings..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
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
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="City, State, Country..."
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      type="number"
                    />
                    <Input
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      type="number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Power (MW)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min MW"
                      value={filters.minPower}
                      onChange={(e) => handleFilterChange('minPower', e.target.value)}
                      type="number"
                    />
                    <Input
                      placeholder="Max MW"
                      value={filters.maxPower}
                      onChange={(e) => handleFilterChange('maxPower', e.target.value)}
                      type="number"
                    />
                  </div>
                </div>

                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {loading ? 'Loading...' : `${listings.length} listings found`}
                </span>
                {filters.type !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getTypeIcon(filters.type)}
                    {formatListingType(filters.type)}
                  </Badge>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map((listing) => (
                  <VoltMarketListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
