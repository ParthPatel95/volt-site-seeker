
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketSavedSearches } from '@/hooks/useVoltMarketSavedSearches';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Zap,
  Save,
  Star,
  Trash2,
  Bell,
  BellOff,
  Map,
  List,
  SlidersHorizontal
} from 'lucide-react';

interface SearchFilters {
  query: string;
  location: string;
  listing_type: string;
  min_price: number;
  max_price: number;
  min_power: number;
  max_power: number;
  verification_required: boolean;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export const VoltMarketAdvancedSearch: React.FC = () => {
  const { profile } = useVoltMarketAuth();
  const { loading, saveSearch, getSavedSearches, deleteSearch, updateSearchNotifications } = useVoltMarketSavedSearches();
  const { toast } = useToast();

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    listing_type: '',
    min_price: 0,
    max_price: 10000000,
    min_power: 0,
    max_power: 100,
    verification_required: false,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchSavedSearches();
    }
  }, [profile]);

  const fetchSavedSearches = async () => {
    const { data, error } = await getSavedSearches();
    if (error) {
      console.error('Error fetching saved searches:', error);
    } else {
      setSavedSearches(data || []);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      toast({
        title: "Search Name Required",
        description: "Please provide a name for your saved search",
        variant: "destructive"
      });
      return;
    }

    const { error } = await saveSearch(searchName, filters, true);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to save search",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Search Saved",
        description: "Your search has been saved with notifications enabled"
      });
      setShowSaveDialog(false);
      setSearchName('');
      fetchSavedSearches();
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    const { error } = await deleteSearch(searchId);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete search",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Search Deleted",
        description: "Saved search has been removed"
      });
      fetchSavedSearches();
    }
  };

  const handleToggleNotifications = async (searchId: string, enabled: boolean) => {
    const { error } = await updateSearchNotifications(searchId, enabled);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive"
      });
    } else {
      toast({
        title: enabled ? "Notifications Enabled" : "Notifications Disabled",
        description: enabled ? "You'll be notified of new matches" : "Notifications turned off"
      });
      fetchSavedSearches();
    }
  };

  const loadSavedSearch = (search: any) => {
    setFilters(search.search_criteria);
    toast({
      title: "Search Loaded",
      description: `Loaded "${search.search_name}" search criteria`
    });
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      listing_type: '',
      min_price: 0,
      max_price: 10000000,
      min_power: 0,
      max_power: 100,
      verification_required: false,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.location) count++;
    if (filters.listing_type) count++;
    if (filters.min_price > 0) count++;
    if (filters.max_price < 10000000) count++;
    if (filters.min_power > 0) count++;
    if (filters.max_power < 100) count++;
    if (filters.verification_required) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Search</h1>
            <p className="text-gray-600">Find the perfect energy listing with powerful filters</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white rounded-lg border">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="w-4 h-4 mr-2" />
                Map
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1 space-y-6">
              {/* Search Query */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Search listings..."
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                  />
                  
                  <Input
                    placeholder="Location (city, state)"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Listing Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Listing Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={filters.listing_type} 
                    onValueChange={(value) => handleFilterChange('listing_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="site_sale">Site for Sale</SelectItem>
                      <SelectItem value="site_lease">Site for Lease</SelectItem>
                      <SelectItem value="hosting">Hosting</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Price Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Price Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      Min Price: ${filters.min_price.toLocaleString()}
                    </label>
                    <Slider
                      value={[filters.min_price]}
                      onValueChange={([value]) => handleFilterChange('min_price', value)}
                      max={5000000}
                      step={50000}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      Max Price: ${filters.max_price.toLocaleString()}
                    </label>
                    <Slider
                      value={[filters.max_price]}
                      onValueChange={([value]) => handleFilterChange('max_price', value)}
                      max={10000000}
                      step={50000}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Power Capacity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Power Capacity (MW)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      Min Power: {filters.min_power} MW
                    </label>
                    <Slider
                      value={[filters.min_power]}
                      onValueChange={([value]) => handleFilterChange('min_power', value)}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      Max Power: {filters.max_power} MW
                    </label>
                    <Slider
                      value={[filters.max_power]}
                      onValueChange={([value]) => handleFilterChange('max_power', value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.verification_required}
                      onChange={(e) => handleFilterChange('verification_required', e.target.checked)}
                    />
                    <span className="text-sm">Verified sellers only</span>
                  </label>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Sort By</label>
                    <Select 
                      value={filters.sort_by} 
                      onValueChange={(value) => handleFilterChange('sort_by', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Date Listed</SelectItem>
                        <SelectItem value="asking_price">Price</SelectItem>
                        <SelectItem value="power_capacity_mw">Power Capacity</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Order</label>
                    <Select 
                      value={filters.sort_order} 
                      onValueChange={(value: 'asc' | 'desc') => handleFilterChange('sort_order', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">High to Low</SelectItem>
                        <SelectItem value="asc">Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => console.log('Search with filters:', filters)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Listings
                </Button>
                
                {profile && (
                  <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Save Search
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Search</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Search name"
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                        />
                        <div className="flex gap-3">
                          <Button onClick={handleSaveSearch} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </Button>
                          <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {/* Saved Searches */}
            {profile && savedSearches.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Saved Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {savedSearches.map((search) => (
                      <div
                        key={search.id}
                        className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                      >
                        <button
                          onClick={() => loadSavedSearch(search)}
                          className="text-sm font-medium text-blue-700 hover:text-blue-800"
                        >
                          {search.search_name}
                        </button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleNotifications(search.id, !search.notification_enabled)}
                        >
                          {search.notification_enabled ? (
                            <Bell className="w-3 h-3 text-blue-600" />
                          ) : (
                            <BellOff className="w-3 h-3 text-gray-400" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSearch(search.id)}
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <p className="text-sm text-gray-600">
                  Found 127 listings matching your criteria
                </p>
              </CardHeader>
              <CardContent>
                {viewMode === 'list' ? (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>Advanced search results will appear here</p>
                    <p className="text-sm">Use the filters to refine your search</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>Map view with search results</p>
                    <p className="text-sm">Interactive map with listing markers</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
