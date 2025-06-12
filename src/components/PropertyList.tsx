
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Zap, 
  Calendar,
  Filter,
  Plus,
  Search,
  ExternalLink
} from 'lucide-react';
import { useProperties, type Property } from '@/hooks/useProperties';
import { PropertyForm } from './PropertyForm';
import { VoltScoreCalculator } from './VoltScoreCalculator';

export function PropertyList() {
  const { properties, loading, refetch } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('discovered_at');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.property_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'volt_score':
        const aScore = a.volt_scores?.[0]?.overall_score || 0;
        const bScore = b.volt_scores?.[0]?.overall_score || 0;
        return bScore - aScore;
      case 'price':
        return (b.asking_price || 0) - (a.asking_price || 0);
      case 'power_capacity':
        return (b.power_capacity_mw || 0) - (a.power_capacity_mw || 0);
      default:
        return new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime();
    }
  });

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'under_contract': return 'bg-yellow-500';
      case 'sold': return 'bg-red-500';
      case 'off_market': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Property Portfolio</h1>
          <p className="text-muted-foreground">Manage and analyze discovered properties</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
            </DialogHeader>
            <PropertyForm 
              onPropertyAdded={() => {
                setShowAddForm(false);
                refetch();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="analyzing">Analyzing</SelectItem>
                <SelectItem value="under_contract">Under Contract</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="data_center">Data Center</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discovered_at">Date Added</SelectItem>
                <SelectItem value="volt_score">VoltScore</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="power_capacity">Power Capacity</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Showing {sortedProperties.length} of {properties.length} properties
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="space-y-4">
        {sortedProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{property.address}</h3>
                    <Badge className={`text-white ${getStatusColor(property.status)}`}>
                      {property.status.replace('_', ' ')}
                    </Badge>
                    {property.volt_scores?.[0] && (
                      <Badge variant={property.volt_scores[0].overall_score >= 80 ? "default" : "secondary"}>
                        VoltScore: {property.volt_scores[0].overall_score}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.city}, {property.state}
                    </div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {property.property_type.replace('_', ' ')}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(property.discovered_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{property.address}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Property Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-medium">Type:</span>
                              <span>{property.property_type.replace('_', ' ')}</span>
                              <span className="font-medium">Square Footage:</span>
                              <span>{property.square_footage?.toLocaleString() || 'N/A'}</span>
                              <span className="font-medium">Lot Size:</span>
                              <span>{property.lot_size_acres ? `${property.lot_size_acres} acres` : 'N/A'}</span>
                              <span className="font-medium">Year Built:</span>
                              <span>{property.year_built || 'N/A'}</span>
                              <span className="font-medium">Zoning:</span>
                              <span>{property.zoning || 'N/A'}</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Power Infrastructure</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <span className="font-medium">Power Capacity:</span>
                              <span>{property.power_capacity_mw ? `${property.power_capacity_mw} MW` : 'N/A'}</span>
                              <span className="font-medium">Substation Distance:</span>
                              <span>{property.substation_distance_miles ? `${property.substation_distance_miles} miles` : 'N/A'}</span>
                              <span className="font-medium">Transmission Access:</span>
                              <span>{property.transmission_access ? 'Yes' : 'No'}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <VoltScoreCalculator 
                        property={property} 
                        onScoreCalculated={refetch}
                      />
                    </div>
                    
                    {property.description && (
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle className="text-base">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{property.description}</p>
                        </CardContent>
                      </Card>
                    )}
                    
                    {property.listing_url && (
                      <div className="mt-4">
                        <Button variant="outline" asChild>
                          <a href={property.listing_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Original Listing
                          </a>
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">{formatPrice(property.asking_price)}</p>
                    <p className="text-xs text-muted-foreground">Asking Price</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">{property.square_footage?.toLocaleString() || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Square Feet</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">{property.power_capacity_mw ? `${property.power_capacity_mw} MW` : 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Power Capacity</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">{property.substation_distance_miles ? `${property.substation_distance_miles} mi` : 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">To Substation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedProperties.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding properties or running the LoopNet scraper'
              }
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Property
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
