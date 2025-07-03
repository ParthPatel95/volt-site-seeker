
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useVoltMarketListings } from '@/hooks/useVoltMarketListings';
import { useVoltMarketSavedSearches } from '@/hooks/useVoltMarketSavedSearches';
import { VoltMarketListingCard } from './VoltMarketListingCard';
import { 
  Search, 
  Filter, 
  MapPin, 
  Zap, 
  DollarSign,
  Save,
  X,
  Building2,
  Calendar
} from 'lucide-react';

export const VoltMarketAdvancedSearch: React.FC = () => {
  const { listings, loading, searchListings } = useVoltMarketListings();
  const { saveSearch, getSavedSearches } = useVoltMarketSavedSearches();
  
  const [searchCriteria, setSearchCriteria] = useState({
    keyword: '',
    listingType: 'all',
    location: '',
    minPrice: 0,
    maxPrice: 10000000,
    minCapacity: 0,
    maxCapacity: 1000,
    status: 'active'
  });
  
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [capacityRange, setCapacityRange] = useState([0, 1000]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');

  const listingTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'site', label: 'Site for Sale' },
    { value: 'hosting', label: 'Hosting' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'lease', label: 'Lease' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'texas', label: 'Texas' },
    { value: 'california', label: 'California' },
    { value: 'arizona', label: 'Arizona' },
    { value: 'nevada', label: 'Nevada' },
    { value: 'florida', label: 'Florida' }
  ];

  const handleSearch = async () => {
    const searchParams = {
      ...searchCriteria,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minCapacity: capacityRange[0],
      maxCapacity: capacityRange[1]
    };

    const results = await searchListings(searchParams);
    setSearchResults(results);
  };

  const handleSaveSearch = async () => {
    if (searchName.trim()) {
      await saveSearch(searchName, searchCriteria);
      setShowSaveDialog(false);
      setSearchName('');
    }
  };

  const clearFilters = () => {
    setSearchCriteria({
      keyword: '',
      listingType: 'all',
      location: '',
      minPrice: 0,
      maxPrice: 10000000,
      minCapacity: 0,
      maxCapacity: 1000,
      status: 'active'
    });
    setPriceRange([0, 10000000]);
    setCapacityRange([0, 1000]);
    setSearchResults([]);
  };

  useEffect(() => {
    // Initial search with default criteria
    handleSearch();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Search</h1>
          <p className="text-gray-600">Find exactly what you're looking for with powerful search filters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Search Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Keyword Search */}
                <div>
                  <Label htmlFor="keyword">Keyword</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="keyword"
                      placeholder="Search listings..."
                      value={searchCriteria.keyword}
                      onChange={(e) => setSearchCriteria({ ...searchCriteria, keyword: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Listing Type */}
                <div>
                  <Label>Listing Type</Label>
                  <Select 
                    value={searchCriteria.listingType} 
                    onValueChange={(value) => setSearchCriteria({ ...searchCriteria, listingType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {listingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label>Location</Label>
                  <Select 
                    value={searchCriteria.location || 'all'} 
                    onValueChange={(value) => setSearchCriteria({ ...searchCriteria, location: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label>Price Range</Label>
                  <div className="px-2 py-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000000}
                      step={50000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Capacity Range */}
                <div>
                  <Label>Power Capacity (MW)</Label>
                  <div className="px-2 py-4">
                    <Slider
                      value={capacityRange}
                      onValueChange={setCapacityRange}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{capacityRange[0]}MW</span>
                      <span>{capacityRange[1]}MW</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button onClick={handleSearch} className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button onClick={() => setShowSaveDialog(true)} variant="outline" className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Search
                  </Button>
                  <Button onClick={clearFilters} variant="ghost" className="w-full">
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Search Results ({searchResults.length})
                </h2>
                <p className="text-gray-600">
                  {searchResults.length} listings match your criteria
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {searchResults.length > 0 ? (
                  searchResults.map((listing) => (
                    <VoltMarketListingCard key={listing.id} listing={listing} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Search Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Save Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="searchName">Search Name</Label>
                  <Input
                    id="searchName"
                    placeholder="Enter a name for this search"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveSearch} className="flex-1">
                    Save
                  </Button>
                  <Button onClick={() => setShowSaveDialog(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
