import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useVoltMarketListings } from '@/hooks/useVoltMarketListings';
import { useVoltMarketSavedSearches } from '@/hooks/useVoltMarketSavedSearches';
import { VoltMarketListingCard } from './VoltMarketListingCard';
import { VoltMarketSearchMap } from './VoltMarketSearchMap';
import { 
  Search, 
  Filter, 
  MapPin, 
  Zap, 
  DollarSign,
  Save,
  X,
  Building2,
  Calendar,
  Map,
  List,
  Heart,
  Bookmark,
  TrendingUp,
  Target,
  Sparkles
} from 'lucide-react';

interface SearchCriteria {
  keyword: string;
  listingType: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minCapacity: number;
  maxCapacity: number;
  status: string;
  verified_only: boolean;
  availability_date?: string;
  property_features?: string[];
  distance_from?: {
    latitude: number;
    longitude: number;
    radius_miles: number;
  };
}

export const VoltMarketEnhancedSearch: React.FC = () => {
  const { listings, loading, searchListings } = useVoltMarketListings();
  const { saveSearch, getSavedSearches, savedSearches, loadSearch } = useVoltMarketSavedSearches();
  
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    keyword: '',
    listingType: 'all',
    location: '',
    minPrice: 0,
    maxPrice: 10000000,
    minCapacity: 0,
    maxCapacity: 1000,
    status: 'active',
    verified_only: false,
    property_features: []
  });
  
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [capacityRange, setCapacityRange] = useState([0, 1000]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState('relevance');
  const [smartSearchEnabled, setSmartSearchEnabled] = useState(true);

  const listingTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'site_sale', label: 'Site for Sale' },
    { value: 'site_lease', label: 'Site for Lease' },
    { value: 'hosting', label: 'Hosting Services' },
    { value: 'equipment', label: 'Equipment' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'capacity_high', label: 'Capacity: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'verified', label: 'Verified First' }
  ];

  const propertyFeatures = [
    'Dual Power Feeds',
    'On-site Backup Generation',
    'Fiber Connectivity',
    'Security Systems',
    'Climate Control',
    'High Voltage Access',
    'Rail Access',
    'Highway Access',
    'Water Access',
    'Renewable Energy Ready'
  ];

  const handleSearch = async () => {
    const searchParams = {
      ...searchCriteria,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minCapacity: capacityRange[0],
      maxCapacity: capacityRange[1],
      sortBy,
      smartSearch: smartSearchEnabled
    };

    const results = await searchListings(searchParams);
    setSearchResults(results);
  };

  const handleSaveSearch = async () => {
    if (searchName.trim()) {
      await saveSearch(searchName, {
        ...searchCriteria,
        priceRange,
        capacityRange,
        sortBy,
        smartSearchEnabled
      });
      setShowSaveDialog(false);
      setSearchName('');
    }
  };

  const handleLoadSavedSearch = async (searchId: string) => {
    const search = await loadSearch(searchId);
    if (search) {
      const criteria = search.criteria as any;
      setSearchCriteria(criteria);
      if (criteria.priceRange) setPriceRange(criteria.priceRange);
      if (criteria.capacityRange) setCapacityRange(criteria.capacityRange);
      if (criteria.sortBy) setSortBy(criteria.sortBy);
      if (criteria.smartSearchEnabled !== undefined) setSmartSearchEnabled(criteria.smartSearchEnabled);
      handleSearch();
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
      status: 'active',
      verified_only: false,
      property_features: []
    });
    setPriceRange([0, 10000000]);
    setCapacityRange([0, 1000]);
    setSortBy('relevance');
    setSmartSearchEnabled(true);
    setSearchResults([]);
  };

  useEffect(() => {
    handleSearch();
    getSavedSearches();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Search</h1>
              <p className="text-gray-600">AI-powered search with advanced filtering and market intelligence</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <Label htmlFor="smart-search" className="text-sm font-medium">Smart Search</Label>
                <Switch
                  id="smart-search"
                  checked={smartSearchEnabled}
                  onCheckedChange={setSmartSearchEnabled}
                />
              </div>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'map')}>
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Map
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Search Filters */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Main Search Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Search Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Semantic Search */}
                  <div>
                    <Label htmlFor="keyword" className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Search Query
                    </Label>
                    <Input
                      id="keyword"
                      placeholder="e.g., '50MW site near Dallas with fiber'"
                      value={searchCriteria.keyword}
                      onChange={(e) => setSearchCriteria({ ...searchCriteria, keyword: e.target.value })}
                      className="mt-2"
                    />
                    {smartSearchEnabled && (
                      <p className="text-xs text-blue-600 mt-1">AI-powered semantic search enabled</p>
                    )}
                  </div>

                  {/* Quick Filters */}
                  <div className="space-y-4">
                    <div>
                      <Label>Listing Type</Label>
                      <Select 
                        value={searchCriteria.listingType} 
                        onValueChange={(value) => setSearchCriteria({ ...searchCriteria, listingType: value })}
                      >
                        <SelectTrigger className="mt-2">
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

                    <div>
                      <Label>Location</Label>
                      <Input
                        placeholder="City, State or ZIP"
                        value={searchCriteria.location}
                        onChange={(e) => setSearchCriteria({ ...searchCriteria, location: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Verified Only
                      </Label>
                      <Switch
                        checked={searchCriteria.verified_only}
                        onCheckedChange={(checked) => setSearchCriteria({ ...searchCriteria, verified_only: checked })}
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Price Range
                    </Label>
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
                    <Label className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Power Capacity (MW)
                    </Label>
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

                  {/* Property Features */}
                  <div>
                    <Label>Property Features</Label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {propertyFeatures.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={feature}
                            checked={searchCriteria.property_features?.includes(feature) || false}
                            onChange={(e) => {
                              const features = searchCriteria.property_features || [];
                              if (e.target.checked) {
                                setSearchCriteria({
                                  ...searchCriteria,
                                  property_features: [...features, feature]
                                });
                              } else {
                                setSearchCriteria({
                                  ...searchCriteria,
                                  property_features: features.filter(f => f !== feature)
                                });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={feature} className="text-sm text-gray-700">
                            {feature}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button onClick={handleSearch} className="w-full">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button onClick={() => setShowSaveDialog(true)} variant="outline" className="w-full">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save Search
                    </Button>
                    <Button onClick={clearFilters} variant="ghost" className="w-full">
                      <X className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Saved Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {savedSearches.map((search) => (
                      <Button
                        key={search.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadSavedSearch(search.id)}
                        className="w-full justify-start text-left"
                      >
                        <span className="truncate">{search.search_name}</span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Search Results ({searchResults.length})
                  </h2>
                  <p className="text-gray-600">
                    {smartSearchEnabled && searchCriteria.keyword && 'AI-enhanced search results'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Content */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'map')}>
                  <TabsContent value="list">
                    {searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {searchResults.map((listing) => (
                          <VoltMarketListingCard key={listing.id} listing={listing} enhanced />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria or enabling smart search</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="map">
                    <VoltMarketSearchMap 
                      listings={searchResults}
                      searchCriteria={searchCriteria}
                      onLocationSelect={(location) => {
                        setSearchCriteria({
                          ...searchCriteria,
                          distance_from: location
                        });
                      }}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>

        {/* Save Search Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Search</DialogTitle>
              <DialogDescription>
                Save your current search criteria to quickly access them later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};