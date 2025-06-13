
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Building, 
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ScrapedPropertyCard } from './ScrapedPropertyCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScrapedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  property_type: string;
  square_footage?: number;
  lot_size_acres?: number;
  asking_price?: number;
  price_per_sqft?: number;
  year_built?: number;
  power_capacity_mw?: number;
  substation_distance_miles?: number;
  transmission_access: boolean;
  zoning?: string;
  description?: string;
  listing_url?: string;
  source: string;
  scraped_at: string;
  moved_to_properties: boolean;
  ai_analysis?: any;
}

export function ScrapedPropertiesDisplay() {
  const [scrapedProperties, setScrapedProperties] = useState<ScrapedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const loadScrapedProperties = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('scraped_properties')
        .select('*')
        .order('scraped_at', { ascending: false });

      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('property_type', typeFilter);
      }

      if (statusFilter === 'available') {
        query = query.eq('moved_to_properties', false);
      } else if (statusFilter === 'moved') {
        query = query.eq('moved_to_properties', true);
      }

      if (searchTerm) {
        query = query.or(`address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading scraped properties:', error);
        throw error;
      }

      setScrapedProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Properties",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScrapedProperties();
  }, [searchTerm, typeFilter, statusFilter]);

  const handlePropertyMoved = () => {
    loadScrapedProperties();
  };

  const availableCount = scrapedProperties.filter(p => !p.moved_to_properties).length;
  const movedCount = scrapedProperties.filter(p => p.moved_to_properties).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-muted-foreground">Loading scraped properties...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{scrapedProperties.length}</p>
                <p className="text-sm text-muted-foreground">Total Scraped</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{availableCount}</p>
                <p className="text-sm text-muted-foreground">Available to Move</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{movedCount}</p>
                <p className="text-sm text-muted-foreground">Moved to Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="data_center">Data Center</SelectItem>
                <SelectItem value="logistics">Logistics</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="available">Available to Move</SelectItem>
                <SelectItem value="moved">Already Moved</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadScrapedProperties}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      {scrapedProperties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">No Scraped Properties Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by running the AI Property Scraper to discover properties'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scrapedProperties.map((property) => (
            <ScrapedPropertyCard
              key={property.id}
              property={property}
              onMoveToProperties={handlePropertyMoved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
